import json
from typing import Any, Dict

from server.tests.base import ServerTestCase
from server.services import content


class TestChoiceController(ServerTestCase):

    def setUp(self):
        from server.db import get_conn
        with get_conn() as conn:
            conn.execute('DELETE FROM quiz_attempt')
            conn.execute('DELETE FROM choice')
            conn.execute('DELETE FROM question')
            conn.execute('DELETE FROM user')
            conn.execute('DELETE FROM quiz')

    def _client(self):
        from typing import Any, cast
        return cast(Any, self.client)

    def _post_json(self, url: str, payload: Dict[str, Any]):
        return self._client().post(url, data=json.dumps(payload), content_type='application/json')

    def _put_json(self, url: str, payload: Dict[str, Any]):
        return self._client().put(url, data=json.dumps(payload), content_type='application/json')

    def test_list_choices_empty(self):
        resp = self._client().get('/api/choice/')
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_create_choice_success(self):
        qz = content.create_quiz('Q', 10)
        q = content.create_question(qz['quiz_id'], '2+2=?', 0)
        resp = self._post_json('/api/choice/', {
            'question_id': q['question_id'],
            'text': '4',
            'is_correct': 1
        })
        assert resp.status_code == 201
        body = resp.get_json()
        assert body['text'] == '4'
        assert body['is_correct'] is True

    def test_create_choice_missing_fields(self):
        resp = self._post_json('/api/choice/', {})
        assert resp.status_code == 400
        assert resp.get_json().get('error') == 'question_id and text required'

    def test_get_choice(self):
        qz = content.create_quiz('Q', 10)
        q = content.create_question(qz['quiz_id'], '2+2=?', 0)
        c = content.create_choice(q['question_id'], '4', 1)
        resp = self._client().get(f"/api/choice/{c['choice_id']}")
        assert resp.status_code == 200
        body = resp.get_json()
        assert body['choice_id'] == c['choice_id']
        assert body['text'] == '4'
        assert body['is_correct'] is True

    def test_get_choice_not_found(self):
        resp = self._client().get('/api/choice/999999')
        assert resp.status_code == 404
        assert resp.get_json().get('error') == 'Not found'

    def test_update_choice_success(self):
        qz = content.create_quiz('Q', 10)
        q = content.create_question(qz['quiz_id'], '2+2=?', 0)
        c = content.create_choice(q['question_id'], '3', 0)
        resp = self._put_json(f"/api/choice/{c['choice_id']}", {
            'text': '4',
            'is_correct': 1
        })
        assert resp.status_code == 200
        body = resp.get_json()
        assert body['text'] == '4'
        assert body['is_correct'] is True

    def test_update_choice_not_found(self):
        resp = self._put_json('/api/choice/123456', {'text': 'nope'})
        assert resp.status_code == 404
        assert resp.get_json().get('error') == 'Not found'

    def test_delete_choice_success(self):
        qz = content.create_quiz('Q', 10)
        q = content.create_question(qz['quiz_id'], '2+2=?', 0)
        c = content.create_choice(q['question_id'], '3', 0)
        resp = self._client().delete(f"/api/choice/{c['choice_id']}")
        assert resp.status_code == 204
        # Verify gone
        resp2 = self._client().get(f"/api/choice/{c['choice_id']}")
        assert resp2.status_code == 404

    def test_delete_choice_not_found(self):
        resp = self._client().delete('/api/choice/424242')
        assert resp.status_code == 404
        assert resp.get_json().get('error') == 'Not found'
        
