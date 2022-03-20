import sys
import requests
import json
import sqlite3
import pandas as pd
con = sqlite3.connect('main_db.db')
def init_app():
    with open('last_change.txt', 'w') as f:
        f.write('0')
if(sys.argv[1] == "init"):
    init_app()
elif(sys.argv[1] == "db"):
    cursor = con.cursor()   
    cursor.execute("SELECT * FROM mymessages")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    cursor.close()  
elif(sys.argv[1] == "cleardb"):
    cursor = con.cursor()   
    cursor.execute("DELETE FROM mymessages")
    con.commit()
    cursor.close()  
    with open('last_change.txt', 'w') as f:
        f.seek(0)
        f.write('0')
        f.truncate()
elif(sys.argv[1] == "export"):
    df = pd.read_sql_query("select * from mymessages", con)
    df.to_csv('message.csv',index=False)
else:
    url = sys.argv[1]
    f = open("last_change.txt", "r+")
    last_update = f.read()
    last_update = int(last_update)
    if(last_update==0):
        x = requests.get(url,data={'last_update':last_update})
        result= x.json()
        f.seek(0)
        f.write(str(result['last_update']))
        f.truncate()
        json_data = result['content']
        columns = ['uuid', 'author', 'message', 'likes']
        value = []
        values = [] 
        for data in json_data:
            for i in columns:
                value.append(dict(data).get(i))   
            values.append(list(value)) 
            value.clear()
        create_query = "create table if not exists mymessages ({0})".format(" text,".join(columns))
        insert_query = "insert into mymessages ({0}) values (?{1})".format(",".join(columns), ",?" * (len(columns)-1))    
        cursor = con.cursor()   
        cursor.execute(create_query)
        cursor.executemany(insert_query , values)
        values.clear()
        con.commit()
        cursor.close()      
    else:
        x = requests.get(url,data={'last_update':last_update})
        result= x.json()
        if(result['last_update']==last_update):
            print('data is lastest')
        else:
            f = open("last_change.txt", "r+")
            f.seek(0)
            f.write(str(result['last_update']))
            f.truncate()
            for transaction in result['content']:
                action = transaction['action']
                uuid = transaction['uuid']
                cursor = con.cursor()   
                if action == "insert":
                    data = json.loads(transaction['data'])
                    author = data['author']
                    message = data['message']
                    likes = data['likes']
                    insert_query = "insert into mymessages (uuid, author, message, likes) values (?,?,?,?);"    
                    cursor.execute(insert_query,(uuid, author, message, likes))
                elif action == "update":
                    data = json.loads(transaction['data'])
                    author = data['author']
                    message = data['message']
                    likes = data['likes']
                    update_query = "update mymessages set author = ?, message = ? , likes = ? where uuid = ?;"    
                    cursor.execute(update_query,(author, message, likes, uuid))
                elif action == "delete":
                    delete_query = "delete from mymessages where uuid = ?;"    
                    cursor.execute(delete_query,(uuid,))
                con.commit()
                cursor.close()


