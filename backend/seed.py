from app import create_app, db
from app.models import Question

app = create_app()

with app.app_context():
    q = Question(
        text="What is your favorite book?",
        answer="1984"
    )
    db.session.add(q)
    db.session.commit()

print("Seed done!")
