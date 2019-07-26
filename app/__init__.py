#! /usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask
from utils.redis import MultiRedis
from etc import AppConfig

redis = MultiRedis()


def register_blueprints(app):
    from app.server import server_api_mod
    app.register_blueprint(server_api_mod, url_prefix='/api/comparison')


def register_plugin(app):
    redis.init_app(app)


def create_app():
    app = Flask(__name__)
    app.config.from_object(AppConfig)
    register_plugin(app)
    register_blueprints(app)
    return app
