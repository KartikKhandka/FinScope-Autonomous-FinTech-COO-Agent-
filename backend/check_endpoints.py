from urllib import request, error
import json
base='http://127.0.0.1:8000/api'
# login
login_data=json.dumps({'username':'admin','password':'password123'}).encode()
req=request.Request(base+'/login', data=login_data, headers={'Content-Type':'application/json'})
try:
    resp=request.urlopen(req)
    token=json.loads(resp.read().decode()).get('access_token')
    print('LOGIN 200')
except error.HTTPError as e:
    print('LOGIN', e.code); print(e.read().decode()); raise SystemExit
hdr={'Authorization':f'Bearer {token}'}
endpoints=['/revenue-analysis','/forecast','/fraud-analysis','/churn-analysis']
for ep in endpoints:
    try:
        r=request.urlopen(request.Request(base+ep, headers=hdr))
        print(ep, r.getcode())
        print(r.read().decode())
    except error.HTTPError as e:
        print(ep, e.code)
        print(e.read().decode())
# generate report
rep_payload=json.dumps({'period_start':'2026-05-01','period_end':'2026-05-31','include_forecast':True}).encode()
try:
    r=request.urlopen(request.Request(base+'/generate-report', data=rep_payload, headers={**hdr,'Content-Type':'application/json'}))
    print('/generate-report', r.getcode()); print(r.read().decode())
except error.HTTPError as e:
    print('/generate-report', e.code); print(e.read().decode())
# ask-coo
q_payload=json.dumps({'question':'What is our highest risk this month?'}).encode()
try:
    r=request.urlopen(request.Request(base+'/ask-coo-agent', data=q_payload, headers={**hdr,'Content-Type':'application/json'}))
    print('/ask-coo-agent', r.getcode()); print(r.read().decode())
except error.HTTPError as e:
    print('/ask-coo-agent', e.code); print(e.read().decode())
