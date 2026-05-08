"""Create a test user for frontend testing."""
from accounts.models import User

# Create test user
email = "testuser@dclean.io"
if not User.objects.filter(email=email).exists():
    user = User.objects.create_user(
        email=email,
        username="testuser",
        password="TestPass123!",
        first_name="Test",
        last_name="User",
    )
    user.is_email_verified = True
    user.save()
    print(f"✅ Created test user: {email} with password: TestPass123!")
else:
    print(f"ℹ️ Test user already exists: {email}")
