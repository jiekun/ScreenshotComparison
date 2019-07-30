# -*- coding: utf-8 -*-

from flask import request, redirect, Response
import json
from flask import jsonify

import random

from config import SITE_URL
from app import redis
from . import server_api_mod
from .logics import receive_urls, get_urls


@server_api_mod.route('/generator/', methods=['POST'])
def save_screenshot_urls():
    column = request.form.get('column')
    comparison_urls = request.form.get('comparison_urls')
    success, redirect_url = receive_urls(comparison_urls, column)
    if success:
        return redirect(redirect_url, code=302)
    else:
        return Response('Invalid Input', status=400, mimetype='application/json')


@server_api_mod.route('/checker/<comparison_code>', methods=['GET'])
def get_json(comparison_code):
    success, data = get_urls(comparison_code)
    if success:
        code = 0
    else:
        code = 1
    response = {
        'code': code,
        'data': data
    }
    return jsonify(**response)
