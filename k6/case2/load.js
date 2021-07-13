import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 70 },
        { duration: '2m', target: 70 },
        { duration: '10s', target: 0 }
    ],
    thresholds: {
        http_req_duration: ['p(99)<100'],
        'logged in successfully': ['p(99)<100'],
        'is status 200': ['p(99)<100'],
    },
};

const BASE_URL = 'http://3.34.133.31';
const USERNAME = 'test@test.com';
const PASSWORD = '1111';

export default function ()  {
    const payload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const loginRes = http.post(`${BASE_URL}/login/token`, payload, params);

    check(loginRes, {
        'logged in successfully': (resp) => resp.json('accessToken') !== '',
    });

    const authHeaders = {
        headers: {
            Authorization: `Bearer ${loginRes.json('accessToken')}`,
            'Content-Type': 'application/json'
        },
    };
    const data = '{"name":"노선1","color":"green darken-1"}'

    const res = http.put(`${BASE_URL}/lines/1`, data, authHeaders);
    check(res, {
        'is status 200': (r) => r.status === 200
    });

    sleep(1);
};