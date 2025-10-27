def _safe_get(row, key, default=None):
    # Works for dicts and sqlite3.Row which doesn't implement get()
    try:
        return row.get(key, default)
    except Exception:
        try:
            return row[key]
        except Exception:
            return default


def choice_row_to_dict(row):
    cid = _safe_get(row, 'choice_id')
    return {
        'id': cid,
        'choice_id': cid,
        'text': _safe_get(row, 'text'),
        'is_correct': bool(_safe_get(row, 'is_correct', 0))
    }


def question_row_to_dict(row, choices=None):
    qid = _safe_get(row, 'question_id')
    return {
        'id': qid,
        'question_id': qid,
        'text': _safe_get(row, 'text'),
        'index': _safe_get(row, 'q_index', _safe_get(row, 'index', 0)),
        'choices': choices or []
    }


def quiz_row_to_dict(row, questions=None):
    qid = _safe_get(row, 'quiz_id')
    out = {
        'id': qid,
        'quiz_id': qid,
        'title': _safe_get(row, 'title'),
        'time_limit': _safe_get(row, 'time_limit')
    }
    if questions is not None:
        out['questions'] = questions
    return out


def user_row_to_dict(row):
    uid = _safe_get(row, 'user_id')
    return {
        'id': uid,
        'user_id': uid,
        'email': _safe_get(row, 'email'),
        'is_admin': bool(_safe_get(row, 'is_admin', 0))
    }


def attempt_row_to_dict(row):
    aid = _safe_get(row, 'attempt_id')
    return {
        'id': aid,
        'attempt_id': aid,
        'user_id': _safe_get(row, 'user_id'),
        'quiz_id': _safe_get(row, 'quiz_id'),
        'score': _safe_get(row, 'score'),
        'started_at': _safe_get(row, 'started_at'),
        # Include email when present (for admin views)
        'email': _safe_get(row, 'email'),
        'attempts_count': _safe_get(row, 'attempts_count')
    }
