import json
from typing import Any, Dict

from server.tests.base import ServerTestCase
from server.services import content


class TestQuestionController(ServerTestCase):

    def setUp(self):
        # Clean DB to ensure test isolation
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

    def test_list_questions_empty(self):
        resp = self._client().get('/api/question/')
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_create_question_success(self):
        quiz = content.create_quiz('QZ', 60)
        resp = self._post_json('/api/question/', {
            'quiz_id': quiz['quiz_id'],
            'text': 'What is Python?'
        })
        assert resp.status_code == 201
        body = resp.get_json()
        assert body['text'] == 'What is Python?'
        assert body['index'] == 0
        assert isinstance(body.get('choices'), list) and len(body['choices']) == 0

    def test_create_question_missing_fields(self):
        # Missing both
        resp = self._post_json('/api/question/', {})
        assert resp.status_code == 400
        assert resp.get_json().get('error') == 'quiz_id and text required'

    def test_get_question_with_choices(self):
        qz = content.create_quiz('Math', 30)
        q = content.create_question(qz['quiz_id'], '2+2=?', 0)
        c1 = content.create_choice(q['question_id'], '3', 0)
        c2 = content.create_choice(q['question_id'], '4', 1)

        resp = self._client().get(f"/api/question/{q['question_id']}")
        assert resp.status_code == 200
        body = resp.get_json()
        assert body['question_id'] == q['question_id']
        texts = [c['text'] for c in body['choices']]
        assert texts == ['3', '4']
        assert body['choices'][0]['is_correct'] is False
        assert body['choices'][1]['is_correct'] is True

    def test_get_question_not_found(self):
        resp = self._client().get('/api/question/999999')
        assert resp.status_code == 404
        assert resp.get_json().get('error') == 'Question not found'

    def test_update_question_success(self):
        qz = content.create_quiz('History', 20)
        q = content.create_question(qz['quiz_id'], 'Old?', 0)
        resp = self._put_json(f"/api/question/{q['question_id']}", {
            'text': 'New?',
            'q_index': 2
        })
        assert resp.status_code == 200
        body = resp.get_json()
        assert body['text'] == 'New?'
        assert body['index'] == 2

    def test_update_question_not_found(self):
        resp = self._put_json('/api/question/123456', {'text': 'Does not matter'})
        assert resp.status_code == 404
        assert resp.get_json().get('error') == 'Question not found'

    def test_delete_question_success(self):
        qz = content.create_quiz('Del', 10)
        q = content.create_question(qz['quiz_id'], 'X?', 0)
        resp = self._client().delete(f"/api/question/{q['question_id']}")
        assert resp.status_code == 204
        # Verify gone
        resp2 = self._client().get(f"/api/question/{q['question_id']}")
        assert resp2.status_code == 404

    def test_delete_question_not_found(self):
        resp = self._client().delete('/api/question/424242')
        assert resp.status_code == 404
        assert resp.get_json().get('error') == 'Question not found'
