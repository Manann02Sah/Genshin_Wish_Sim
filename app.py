from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import random
import json
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///genshin_wishes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    wishes = db.relationship('Wish', backref='user', lazy=True)
    banner_states = db.relationship('UserBannerState', backref='user', lazy=True)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    rarity = db.Column(db.Integer, nullable=False)  # 3, 4, or 5
    item_type = db.Column(db.String(20), nullable=False)  # 'character' or 'weapon'
    banner_type = db.Column(db.String(20), nullable=False)  # 'character', 'weapon', 'standard'
    is_featured = db.Column(db.Boolean, default=False)
    image_url = db.Column(db.String(200), default='')

class Wish(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    banner_type = db.Column(db.String(20), nullable=False)
    pity_count = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    item = db.relationship('Item', backref='wishes')

class UserBannerState(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    banner_type = db.Column(db.String(20), nullable=False)
    pity_5star = db.Column(db.Integer, default=0)
    pity_4star = db.Column(db.Integer, default=0)
    guaranteed_featured = db.Column(db.Boolean, default=False)
    fate_points = db.Column(db.Integer, default=0)  # For weapon banner
    selected_weapon_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=True)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Wishing Logic
class WishSimulator:
    @staticmethod
    def get_rates(banner_type, pity_count):
        """Calculate rates based on banner type and pity count"""
        base_5star = 0.006 if banner_type != 'weapon' else 0.007
        base_4star = 0.051
        
        # Soft pity calculation
        soft_pity_start = 75 if banner_type != 'weapon' else 65
        hard_pity = 90 if banner_type != 'weapon' else 80
        
        if pity_count >= hard_pity:
            return 1.0, 0  # Guaranteed 5-star
        elif pity_count >= soft_pity_start:
            # Soft pity increases rates
            increase = (pity_count - soft_pity_start + 1) * 0.06
            return min(base_5star + increase, 1.0), base_4star
        else:
            return base_5star, base_4star
    
    @staticmethod
    def perform_wish(user_id, banner_type, count=1):
        """Perform wish simulation"""
        user = User.query.get(user_id)
        if not user:
            return None
        
        # Get or create banner state
        banner_state = UserBannerState.query.filter_by(
            user_id=user_id, banner_type=banner_type
        ).first()
        
        if not banner_state:
            banner_state = UserBannerState(
                user_id=user_id, 
                banner_type=banner_type
            )
            db.session.add(banner_state)
        
        results = []
        
        for _ in range(count):
            banner_state.pity_5star += 1
            banner_state.pity_4star += 1
            
            # Calculate rates
            rate_5star, rate_4star = WishSimulator.get_rates(
                banner_type, banner_state.pity_5star
            )
            
            # Determine rarity
            rand = random.random()
            if rand < rate_5star:
                # 5-star pull
                item = WishSimulator.get_5star_item(banner_type, banner_state)
                banner_state.pity_5star = 0
                rarity = 5
            elif rand < rate_5star + rate_4star or banner_state.pity_4star >= 10:
                # 4-star pull
                item = WishSimulator.get_4star_item(banner_type)
                banner_state.pity_4star = 0
                rarity = 4
            else:
                # 3-star pull
                item = WishSimulator.get_3star_item()
                rarity = 3
            
            # Create wish record
            wish = Wish(
                user_id=user_id,
                item_id=item.id,
                banner_type=banner_type,
                pity_count=banner_state.pity_5star if rarity == 5 else banner_state.pity_4star
            )
            db.session.add(wish)
            
            results.append({
                'item': item,
                'rarity': rarity,
                'pity_count': wish.pity_count
            })
        
        db.session.commit()
        return results
    
    @staticmethod
    def get_5star_item(banner_type, banner_state):
        """Get 5-star item based on banner type and guarantees"""
        if banner_type == 'character':
            featured_chars = Item.query.filter_by(
                rarity=5, banner_type='character', is_featured=True
            ).all()
            standard_chars = Item.query.filter_by(
                rarity=5, banner_type='standard', item_type='character'
            ).all()
            
            if banner_state.guaranteed_featured or random.random() < 0.5:
                # Get featured character
                banner_state.guaranteed_featured = False
                return random.choice(featured_chars) if featured_chars else random.choice(standard_chars)
            else:
                # Lost 50/50
                banner_state.guaranteed_featured = True
                return random.choice(standard_chars)
        
        elif banner_type == 'weapon':
            featured_weapons = Item.query.filter_by(
                rarity=5, banner_type='weapon', is_featured=True
            ).all()
            
            if banner_state.fate_points >= 2:
                # Guaranteed selected weapon
                banner_state.fate_points = 0
                selected_weapon = Item.query.get(banner_state.selected_weapon_id)
                return selected_weapon if selected_weapon else random.choice(featured_weapons)
            else:
                weapon = random.choice(featured_weapons) if featured_weapons else None
                if weapon and weapon.id != banner_state.selected_weapon_id:
                    banner_state.fate_points += 1
                else:
                    banner_state.fate_points = 0
                return weapon
        
        else:  # standard banner
            standard_items = Item.query.filter_by(
                rarity=5, banner_type='standard'
            ).all()
            return random.choice(standard_items) if standard_items else None
    
    @staticmethod
    def get_4star_item(banner_type):
        """Get 4-star item"""
        items = Item.query.filter_by(rarity=4).all()
        return random.choice(items) if items else None
    
    @staticmethod
    def get_3star_item():
        """Get 3-star item"""
        items = Item.query.filter_by(rarity=3).all()
        return random.choice(items) if items else None

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return render_template('register.html')
        
        user = User(
            username=username,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return redirect(url_for('dashboard'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/wish')
@login_required
def wish():
    return render_template('wish.html')

@app.route('/api/wish', methods=['POST'])
@login_required
def api_wish():
    data = request.get_json()
    banner_type = data.get('banner_type', 'character')
    count = data.get('count', 1)
    
    results = WishSimulator.perform_wish(current_user.id, banner_type, count)
    
    if results:
        return jsonify({
            'success': True,
            'results': [{
                'name': r['item'].name,
                'rarity': r['rarity'],
                'type': r['item'].item_type,
                'pity_count': r['pity_count']
            } for r in results]
        })
    else:
        return jsonify({'success': False, 'error': 'Wish failed'})

@app.route('/api/stats')
@login_required
def api_stats():
    wishes = Wish.query.filter_by(user_id=current_user.id).all()
    
    total_wishes = len(wishes)
    five_star_count = len([w for w in wishes if w.item.rarity == 5])
    four_star_count = len([w for w in wishes if w.item.rarity == 4])
    
    # Current pity counts
    banner_states = {
        state.banner_type: state for state in 
        UserBannerState.query.filter_by(user_id=current_user.id).all()
    }
    
    return jsonify({
        'total_wishes': total_wishes,
        'five_star_count': five_star_count,
        'four_star_count': four_star_count,
        'luck_rate': round((five_star_count / total_wishes * 100), 2) if total_wishes > 0 else 0,
        'pity_counts': {
            banner_type: state.pity_5star for banner_type, state in banner_states.items()
        }
    })

@app.route('/api/history')
@login_required
def api_history():
    page = request.args.get('page', 1, type=int)
    banner_filter = request.args.get('banner', '')
    rarity_filter = request.args.get('rarity', '', type=int)
    
    query = Wish.query.filter_by(user_id=current_user.id)
    
    if banner_filter:
        query = query.filter_by(banner_type=banner_filter)
    
    if rarity_filter:
        query = query.join(Item).filter(Item.rarity == rarity_filter)
    
    wishes = query.order_by(Wish.timestamp.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return jsonify({
        'wishes': [{
            'id': w.id,
            'item_name': w.item.name,
            'rarity': w.item.rarity,
            'type': w.item.item_type,
            'banner_type': w.banner_type,
            'timestamp': w.timestamp.isoformat(),
            'pity_count': w.pity_count
        } for w in wishes.items],
        'has_next': wishes.has_next,
        'has_prev': wishes.has_prev,
        'page': page,
        'pages': wishes.pages
    })

def init_db():
    """Initialize database with sample data"""
    db.create_all()
    
    # Check if data already exists
    if Item.query.first():
        return
    
    # Sample characters
    characters = [
        # 5-star featured characters
        {'name': 'Zhongli', 'rarity': 5, 'item_type': 'character', 'banner_type': 'character', 'is_featured': True},
        {'name': 'Venti', 'rarity': 5, 'item_type': 'character', 'banner_type': 'character', 'is_featured': True},
        {'name': 'Childe', 'rarity': 5, 'item_type': 'character', 'banner_type': 'character', 'is_featured': True},
        
        # 5-star standard characters
        {'name': 'Diluc', 'rarity': 5, 'item_type': 'character', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Qiqi', 'rarity': 5, 'item_type': 'character', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Keqing', 'rarity': 5, 'item_type': 'character', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Mona', 'rarity': 5, 'item_type': 'character', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Jean', 'rarity': 5, 'item_type': 'character', 'banner_type': 'standard', 'is_featured': False},
        
        # 4-star characters
        {'name': 'Bennett', 'rarity': 4, 'item_type': 'character', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Xingqiu', 'rarity': 4, 'item_type': 'character', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Fischl', 'rarity': 4, 'item_type': 'character', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Sucrose', 'rarity': 4, 'item_type': 'character', 'banner_type': 'standard', 'is_featured': False},
    ]
    
    # Sample weapons
    weapons = [
        # 5-star featured weapons
        {'name': 'Staff of Homa', 'rarity': 5, 'item_type': 'weapon', 'banner_type': 'weapon', 'is_featured': True},
        {'name': 'Elegy for the End', 'rarity': 5, 'item_type': 'weapon', 'banner_type': 'weapon', 'is_featured': True},
        
        # 5-star standard weapons
        {'name': 'Wolf\'s Gravestone', 'rarity': 5, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Skyward Harp', 'rarity': 5, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Primordial Jade Winged-Spear', 'rarity': 5, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
        
        # 4-star weapons
        {'name': 'Sacrificial Sword', 'rarity': 4, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'The Widsith', 'rarity': 4, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Rust', 'rarity': 4, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
    ]
    
    # 3-star weapons
    three_star_weapons = [
        {'name': 'Cool Steel', 'rarity': 3, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Harbinger of Dawn', 'rarity': 3, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Magic Guide', 'rarity': 3, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Slingshot', 'rarity': 3, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
        {'name': 'Thrilling Tales of Dragon Slayers', 'rarity': 3, 'item_type': 'weapon', 'banner_type': 'standard', 'is_featured': False},
    ]
    
    all_items = characters + weapons + three_star_weapons
    
    for item_data in all_items:
        item = Item(**item_data)
        db.session.add(item)
    
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True)
