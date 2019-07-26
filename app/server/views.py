# -*- coding: utf-8 -*-

from flask import request, redirect, Response
import json
from flask import jsonify

import string
import random

from config import SITE_URL
from app import redis
from . import server_api_mod

redis = redis['LOCAL']

RANDOM_CODE = string.ascii_uppercase + string.digits


@server_api_mod.route('/generator/', methods=['POST'])
def save_screenshot_urls():
    column = request.form.get('column')
    comparison_urls = request.form.get('comparison_urls')
    save_content = {
        'column': column,
        'comparison_urls': comparison_urls
    }
    comparison_code = generate_code()
    value = is_jsonable(save_content)
    if value:
        redis.set(comparison_code, value)
        redirect_url = 'http://' + SITE_URL + "/checker.html?c=" + comparison_code
        return redirect(redirect_url, code=302)
    else:
        return Response('Invalid JSON', status=400, mimetype='application/json')


def is_jsonable(content):
    try:
        jsoned = json.dumps(content)
    except ValueError:
        return False
    return jsoned


@server_api_mod.route('/checker/<comparison_code>', methods=['GET'])
def get_json(comparison_code):
    try:
        saved_content = redis.get(comparison_code)
        saved_content = json.loads(saved_content)
        comparison_urls = saved_content['comparison_urls']
        column = saved_content['column']
    except Exception as e:
        print(e)
        column = ''
        comparison_urls = ''
    return jsonify(column=column, comparison_urls=comparison_urls)


def generate_code(length=8):
    max_len = len(RANDOM_CODE)
    code = ''
    for i in range(length):
        code += RANDOM_CODE[random.randint(0, max_len - 1)]
    return code
