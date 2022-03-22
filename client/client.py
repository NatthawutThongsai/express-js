import sys
import requests
import pandas as pd
import math
import time
start_time = time.time()
df = pd.DataFrame(columns = ['uuid', 'author', 'message', 'likes'])
url = sys.argv[1]
x = requests.get(url, timeout=1000)
result = x.json()
limit = 100000
for page in range(0, math.ceil(result/limit), 1):
    y = requests.get(url+"/get_by_offset/?page=" +str(page)+"&limit="+str(limit))
    json_data = y.json()['content']
    df = pd.concat([df, pd.DataFrame(json_data)])
print("--- %s seconds ---" % (time.time() - start_time))
print('Sync complete')
df.to_csv('message.csv', index=False)
print("--- %s seconds ---" % (time.time() - start_time))
