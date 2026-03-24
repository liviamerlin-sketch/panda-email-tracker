from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime, timezone
import requests
import os

NOTION_TOKEN = os.environ["NOTION_TOKEN"]
NOTION_DB_ID = os.environ["NOTION_DATABASE_ID"]

# Pixel GIF 1x1 transparente
PIXEL = (
    b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff"
    b"\x00\x00\x00!\xf9\x04\x00\x00\x00\x00\x00,"
    b"\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
)

def update_notion(email: str):
    """Atualiza o status do lead no Notion para 'Aberto'."""
    # Busca a página pelo email
    search_url = "https://api.notion.com/v1/databases/{}/query".format(NOTION_DB_ID)
    headers = {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    payload = {
        "filter": {
            "property": "Email",
            "title": {"equals": email}
        }
    }
    r = requests.post(search_url, headers=headers, json=payload)
    results = r.json().get("results", [])

    if not results:
        return

    page_id = results[0]["id"]

    # Atualiza o status para "Aberto"
    update_url = f"https://api.notion.com/v1/pages/{page_id}"
    requests.patch(update_url, headers=headers, json={
        "properties": {
            "Status": {"select": {"name": "Aberto"}},
            "Data de envio": {"date": {"start": datetime.now(timezone.utc).isoformat()}}
        }
    })

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        email  = params.get("id", [""])[0]

        if email:
            try:
                update_notion(email)
            except Exception as e:
                print(f"Erro Notion: {e}")

        # Retorna o pixel transparente
        self.send_response(200)
        self.send_header("Content-Type", "image/gif")
        self.send_header("Cache-Control", "no-store, no-cache")
        self.end_headers()
        self.wfile.write(PIXEL)

    def log_message(self, format, *args):
        pass  # silencia logs desnecessários
