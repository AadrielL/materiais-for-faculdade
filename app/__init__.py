from flask import Flask
import os

def create_app():
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = 'uploads'

    # Garante que a pasta de uploads existe na raiz
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    # Importa os Blueprints
    from app.views.main_views import main_bp
    from app.controllers.file_controller import file_bp
    
    # Registra ambos (Main para a tela, File para o processamento)
    app.register_blueprint(main_bp)
    app.register_blueprint(file_bp)

    return app