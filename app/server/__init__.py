# -*- coding: utf-8 -*-
# @File    : __init__.py

from flask import Blueprint

server_api_mod = Blueprint('comparison', __name__)

from . import views

