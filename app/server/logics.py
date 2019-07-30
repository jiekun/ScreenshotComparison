# -*- coding: utf-8 -*-
# @Time    : 19-7-30 20:30
# @Author  : duck
# @File    : logics.py

import string
import random
import json
import re
from datetime import datetime
from config import SITE_URL

from app import redis

redis = redis['LOCAL']

RANDOM_CODE = string.ascii_uppercase + string.digits


def receive_urls(urls, columns):
    """
    Parse user input columns & urls
    :param urls:
    :param columns:
    :return:
    """
    urls = validate_urls(urls)
    urls, columns = validate_compare_field(urls, columns)
    if urls and columns:
        save_content = {
            'columns': columns,
            'urls': urls
        }
        comparison_code = generate_code()
        value = is_jsonable(save_content)

        if value:
            redis.set(comparison_code, value)
            redirect_url = 'https://' + SITE_URL + "/checker?c=" + comparison_code
            success, redirect_url = True, redirect_url
        else:
            success, redirect_url = False, ''
    else:
        success, redirect_url = False, ''
    return success, redirect_url


def get_urls(comparison_code):
    """
    Get comparison urls and field by code
    :param comparison_code:
    :return:
    """
    try:
        saved_content = redis.get(comparison_code)
        saved_content = json.loads(saved_content)
        urls = saved_content['urls']
        columns = saved_content['columns']
        data = {
            'column': '\n'.join(columns),
            'comparison_urls': '\n'.join(urls)
        }
        success = True
    except Exception as e:
        success, data = False, {}
    return success, data


def is_jsonable(content):
    try:
        jsoned = json.dumps(content)
    except ValueError:
        return False
    return jsoned


def generate_code(length=8):
    max_len = len(RANDOM_CODE)
    code = ''
    for i in range(length):
        code += RANDOM_CODE[random.randint(0, max_len - 1)]
    return code


def validate_urls(urls):
    """
    Receive urls in str or list format
    Convert them to a list
    Return false if list element doesn't match regex
    :param urls:
    :return:
    """
    try:
        if isinstance(urls, str):
            # support 'url, url' and 'url\nurl' etc
            urls = urls.replace(' ', '')
            urls = urls.replace('\r', '')
            urls = urls.replace(',', '\n')
            urls = urls.split('\n')
        if isinstance(urls, list):
            reg_pattern = r"^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$"
            pattern = re.compile(reg_pattern)
            for each_url in urls:
                if pattern.match(each_url) is None:
                    return None
        else:
            return None
        return urls
    except Exception as e:
        return None


def validate_compare_field(urls, columns):
    """
    Validate if urls match columns
    :param urls:
    :param columns:
    :return:
    """
    try:
        if isinstance(columns, str):
            if columns == '':
                columns = 'Source\nEncode'
            columns = columns.replace(' ', '')
            columns = columns.replace('\r', '')
            columns = columns.replace(',', '\n')
            columns = columns.split('\n')
        if isinstance(columns, list):
            if len(urls) % len(columns) == 0:
                return urls, columns
            else:
                return None, None
        else:
            return None, None
    except Exception as e:
        return None, None
