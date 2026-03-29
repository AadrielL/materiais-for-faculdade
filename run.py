from app import create_app
import os

app = create_app()

# Garante que a pasta de uploads exista logo na inicialização do app
if not os.path.exists('uploads'):
    os.makedirs('uploads')

if __name__ == "__main__":
    # O Render usa a variável de ambiente PORT, se não existir usa 5000
    port = int(os.environ.get("PORT", 5000))
    # Em produção (Render), o debug deve ser False
    app.run(host='0.0.0.0', port=port, debug=False)