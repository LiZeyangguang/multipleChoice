import json
from typing import Any, Dict
from server.tests.base import ServerTestCase
from server.services import content


class TestQuizController(ServerTestCase):

    def setUp(self):
        # Clean db state
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

    # helpers to post and put json
    def _post_json(self, url: str, payload: Dict[str, Any]):
        return self._client().post(url, data=json.dumps(payload), content_type='application/json')

    def _put_json(self, url: str, payload: Dict[str, Any]):
        return self._client().put(url, data=json.dumps(payload), content_type='application/json')

    def test_list_quizzes_empty(self):
        resp = self._client().get('/api/quiz/')
        assert resp.status_code == 200
        data = resp.get_json()
        assert isinstance(data, list)
        assert data == []

    def test_create_quiz_success(self):
        resp = self._post_json('/api/quiz/', {"title": "Sample Quiz", "time_limit": 90})
        assert resp.status_code == 201
        body = resp.get_json()
        # Basic shape
        assert body.get('quiz_id') is not None
        assert body['title'] == 'Sample Quiz'
        assert body['time_limit'] == 90
        # Newly created quiz should include empty questions list
        assert 'questions' in body
        assert isinstance(body['questions'], list)
        assert len(body['questions']) == 0

    def test_get_quiz_by_id_with_nested(self):
        # Arrange
        qrow = content.create_quiz('Nested Quiz', 45)
        quiz_id = qrow['quiz_id']
        q1 = content.create_question(quiz_id, 'What is 2+2?', 0)
        content.create_choice(q1['question_id'], '3', 0)
        content.create_choice(q1['question_id'], '4', 1)

        # Act
        resp = self._client().get(f'/api/quiz/{quiz_id}')

        # Assert
        assert resp.status_code == 200
        body = resp.get_json()
        assert body['quiz_id'] == quiz_id
        assert body['title'] == 'Nested Quiz'
        assert isinstance(body.get('questions'), list)
        assert len(body['questions']) == 1
        q = body['questions'][0]
        assert q['text'] == 'What is 2+2?'
        assert q['index'] == 0
        assert isinstance(q.get('choices'), list)
        assert [c['text'] for c in q['choices']] == ['3', '4']
        # Ensure boolean is correct
        assert q['choices'][0]['is_correct'] is False
        assert q['choices'][1]['is_correct'] is True

    def test_get_quiz_not_found(self):
        resp = self._client().get('/api/quiz/999999')
        assert resp.status_code == 404
        assert resp.get_json().get('error') == 'Quiz not found'

    def test_create_quiz_missing_title(self):
        resp = self._post_json('/api/quiz/', {})
        assert resp.status_code == 400
        assert resp.get_json().get('error') == 'title required'

    def test_update_quiz_success(self):
        created = content.create_quiz('Old Title', 60)
        quiz_id = created['quiz_id']

        resp = self._put_json(f'/api/quiz/{quiz_id}', {"title": "New Title", "time_limit": 120})
        assert resp.status_code == 200
        body = resp.get_json()
        assert body['quiz_id'] == quiz_id
        assert body['title'] == 'New Title'
        assert body['time_limit'] == 120

    def test_update_quiz_not_found(self):
        resp = self._put_json('/api/quiz/424242', {"title": "Does Not Matter"})
        assert resp.status_code == 404
        assert resp.get_json().get('error') == 'Not found'

    def test_delete_quiz_success(self):
        created = content.create_quiz('To Delete', 30)
        quiz_id = created['quiz_id']
        resp = self._client().delete(f'/api/quiz/{quiz_id}')
        assert resp.status_code == 204
        # Verify it's gone
        resp2 = self._client().get(f'/api/quiz/{quiz_id}')
        assert resp2.status_code == 404

    def test_delete_quiz_not_found(self):
        resp = self._client().delete('/api/quiz/555555')
        assert resp.status_code == 404
        assert resp.get_json().get('error') == 'Not found'

    def test_list_quizzes_multiple(self):
        # Arrange
        content.create_quiz('Quiz A', 10)
        content.create_quiz('Quiz B', 20)

        resp = self._client().get('/api/quiz/')
        assert resp.status_code == 200
        data = resp.get_json()
        titles = sorted([item['title'] for item in data])
        assert titles[:2] == ['Quiz A', 'Quiz B']
