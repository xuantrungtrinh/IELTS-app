import os
from flask import Flask
from app.extensions import db
from flask_cors import CORS
from app.routes.vocab import vocab_bp
from app.routes.auth import auth_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # đường dẫn tuyệt đối tới instance/
    base_dir = os.path.abspath(os.path.dirname(__file__))
    instance_path = os.path.join(base_dir, "..", "instance")
    os.makedirs(instance_path, exist_ok=True)

    if os.getenv("DATABASE_URL"):
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = (
            "sqlite:///" + os.path.join(instance_path, "app.db")
        )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    from app.models import Question

    with app.app_context():
        db.create_all()

        # ✅ SAFE SEED – chỉ seed nếu DB trống
        if Question.query.count() == 0:
            from app.seed_data.vocab_data import ALL_VOCABS
            for item in ALL_VOCABS:
                db.session.add(Question(**item))
            db.session.commit()
            print("✅ Seeded initial IELTS vocab")

    app.register_blueprint(vocab_bp)
    app.register_blueprint(auth_bp)

    return app