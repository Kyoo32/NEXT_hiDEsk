# encoding=utf8 
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import random
#import js2py



from flask import Flask, url_for, render_template, request , json, session, redirect
from flask.ext.mysql import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import os

app = Flask(__name__)
mysql = MySQL()
app.secret_key = 'why would I tell you my secret key?'

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'DeskUser'
app.config['MYSQL_DATABASE_PASSWORD'] = 'desk123!@#'
app.config['MYSQL_DATABASE_DB'] = 'dbDeskProject'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
app.config['UPLOAD_FOLDER'] = 'static\\Uploads'
mysql.init_app(app)




@app.route("/")
def main():
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        file = request.files['file']
        extension = os.path.splitext(file.filename)[1]
        f_name = str(uuid.uuid4()) + extension
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], f_name))
        return json.dumps({'filename':f_name})


@app.route("/showSignUp")
def showSignUp():
    return render_template('signup.html')


@app.route('/showSignin')
def showSignin():
    if session.get('user_name'):
        return render_template('userHome.html',user_name=session.get('user_name'))
    else:
        return render_template('signin.html')

@app.route('/viewDesk')
def viewDesk():
    con = mysql.connect()
    cursor = con.cursor()
    cursor.callproc('sp_getDesk')
    desks = cursor.fetchall()
    if desks:
        desk = random.choice(desks)
    else:
         return render_template('error.html', error='No desk yet!')

    photo = desk[4]
    desk_num = desk[0]
    session['desk_num'] = desk_num
    print(desk_num)
    cursor.close()
    cursor = con.cursor()
    cursor.callproc('sp_getUserNickName', (desk[5],))
    user = cursor.fetchall()
    userNickName = user[0]

    print(user)
    #user string needs to be changed
    return render_template('viewDesk.html', desk_id=desk_num, NextDesks=photo, nickName=userNickName)


@app.route('/showComment')
def showComment():
    if session.get('user'):
        return render_template('comment.html')
    else:
        return render_template('error.html',error = 'Unauthorized Access')

@app.route('/showAddComment')
def showAddComment():
    return render_template('addComment.html')

@app.route('/getComment')
def getComment():
    try:
        if session.get('user'):
            _user = session.get('user')
            _desk_num = session.get('desk_num')
            con = mysql.connect()
            cursor = con.cursor()
            cursor.callproc('sp_getCommentByDesk',(_desk_num,))
            wishes = cursor.fetchall()

            wishes_dict = []
            for wish in wishes:
                wish_dict = {
                    'Id': wish[0],
                    'Title': wish[1],
                    'Date': wish[2],
                }
                wishes_dict.append(wish_dict)

            return json.dumps(wishes_dict)
        else:
            return render_template('error.html', error = 'Unauthorized Access')
    except Exception as e:
        return render_template('error.html', error = str(e))

@app.route('/userHome')
def userHome():
    if session.get('user'):
        return render_template('userHome.html', user_name = session.get('user_name'))
    else:
        return render_template('error.html',error = 'Unauthorized Access')

@app.route('/logout')
def logout():
    session.pop('user',None)
    session.pop('user_name',None)
    session.pop('desk_num',None)
    return redirect('/')

@app.route('/validateLogin',methods=['POST'])
def validateLogin():
    try:
        _username = request.form['inputEmail']
        _password = request.form['inputPassword']

        # connect to mysql
        con = mysql.connect()
        cursor = con.cursor()
        cursor.callproc('sp_validateLogin', (_username,))
        data = cursor.fetchall()
        print(data)

        if len(data) > 0:
            if check_password_hash(str(data[0][3]), _password):
                session['user'] = data[0][0]
                print data
                session['user_name'] = data[0][1]
                return redirect('/userHome')
            else:
                return render_template('error.html',error = 'Wrong NikcName or Password.')
        else:
            return render_template('error.html',error = 'Wrong Email address or Password.')


    except Exception as e:
        return render_template('error.html',error = str(e))
    finally:
        cursor.close()
        con.close()


@app.route('/signUp', methods=['POST', 'GET'])
def signUp():
    try:
        _name = request.form['inputName']
        _nickName = request.form['inputEmail']
        _password = request.form['inputPassword']

        if _name and _nickName and _password:

            conn = mysql.connect()
            cursor = conn.cursor()
            _hashed_password = generate_password_hash(_password)
            cursor.callproc('sp_createUser',(_name,_nickName,_hashed_password))
            data = cursor.fetchall()
            if len(data) is 0 :
                conn.commit()
                return json.dumps({'message':'User created successfully !'})
            else:
                return json.dumps({'error':str(data[0])})
        else:
            return json.dumps({'html':'<span>Enter the required fields</span>'})

    except Exception as e:
        return json.dumps({'error':str(e)})
    finally:
        cursor.close()
        conn.close()


@app.route('/showAddDesk')
def showAddDesk():
    return render_template('addDesk.html')

@app.route('/addDesk',methods=['POST'])
def addDesk():
    try:
        if session.get('user'):
            _title = request.form['inputTitle']
            _user = session.get('user')

            if request.form.get('filePath') is None:
                _filePath = ''
            else:
                _filePath = request.form.get('filePath')


            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.callproc('sp_addDesk',(_title,_filePath,_user))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                return redirect('/userHome')
            else:
                return render_template('error.html',error = 'An error occurred!')

        else:
            return render_template('error.html',error = 'Unauthorized Access')
    except Exception as e:
        return render_template('error.html',error = str(e))
    finally:
        cursor.close()
        conn.close()

@app.route('/addComment',methods=['post'])
def addComment():
    try:
        if session.get('user'):

            conn = mysql.connect()
            cursor = conn.cursor()
            _title = request.form['inputDescription']
            _user = session.get('user')
            _desk_id = session.get('desk_num')
            print(_desk_id)

            cursor.callproc('sp_addComment',(_title,_desk_id,_user))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                return redirect('/showComment')
            else:
                return render_template('error.html',error = 'An error occurred!')

        else:
            return render_template('error.html',error = 'Unauthorized Access')
    except Exception as e:
        return render_template('error.html',error = str(e))
    finally:
        cursor.close()
        conn.close()




if __name__ == "__main__":
    app.run(port=5001, debug=True)

