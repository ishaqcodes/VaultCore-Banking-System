import threading
import requests

# ⚠️ Yahan apna Ishaq wala Token Paste kar
TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoZWVuYSIsImlhdCI6MTc2NjY1MDQ5MiwiZXhwIjoxNzY2NjUwNjEyfQ.aGnQyYo6YvewobEiQkGRYgPJ71FvMJ9kcuuA9dy7Bkk"

URL = "http://localhost:8080/api/transaction/transfer"

# Hum koshish karenge 51,000 bhejne ki (Jabki balance sirf 51,000 hai)
# Agar 2 baar success hua, matlab BUG hai. Sirf 1 baar success hona chahiye.
payload = {
    "receiverAccount": "ACC-ISHAQ-786", 
    "amount": 31000
}

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def attack_server():
    try:
        response = requests.post(URL, json=payload, headers=headers)
        print(f"Status: {response.status_code} | Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

# --- ATTACK START ---
print("🚀 Launching 5 Simultaneous Requests...")

threads = []
# Hum 5 threads (requests) ek sath bhejenge
for i in range(5):
    t = threading.Thread(target=attack_server)
    threads.append(t)
    t.start()

# Wait karo sab khatam hone ka
for t in threads:
    t.join()

print("✅ Test Complete. Check Database/Dashboard Balance.")