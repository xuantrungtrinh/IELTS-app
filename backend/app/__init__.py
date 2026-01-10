import os
from flask import Flask
from app.extensions import db
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # đường dẫn tuyệt đối tới instance/
    base_dir = os.path.abspath(os.path.dirname(__file__))
    instance_path = os.path.join(base_dir, "..", "instance")
    os.makedirs(instance_path, exist_ok=True)

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
            VOCABS = [
                {"text": "itinerary", "answer": "a planned route or journey", "topic": "Travel"},
                {"text": "accommodation", "answer": "a place to stay", "topic": "Travel"},

                {"text": "curriculum", "answer": "the subjects taught in a school", "topic": "Education"},
                {"text": "tuition", "answer": "money paid for education", "topic": "Education"},

                {"text": "innovation", "answer": "a new idea or method", "topic": "Technology"},
                {"text": "automation", "answer": "the use of machines to do work", "topic": "Technology"},

                {"text": "mitigate", "answer": "to make something less severe", "topic": "Environment"},
                {"text": "sustainability", "answer": "the ability to maintain resources long-term",
                 "topic": "Environment"},
            ]

            for item in VOCABS:
                q = Question(**item)
                db.session.add(q)

            db.session.commit()
            print("✅ Seeded initial IELTS vocab")

    from app.routes.vocab import vocab_bp
    app.register_blueprint(vocab_bp)

    return app



