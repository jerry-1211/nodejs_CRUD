const express = require('express')
const app = express();
const fs = require('fs');
const ejs = require('ejs');
const mysql = require('mysql2')
const bodyParser = require('body-parser');
const { response, application } = require('express');
const { resourceLimits } = require('worker_threads');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session); // 세션을 파일에 저장
const cookieParser = require('cookie-parser');
const MySQLStore = require('express-mysql-session')(session);


//----------------------------------------------------------------------------- 세션
var options = {
  host :'localhost',
  user :'root',
  password : '1234',
  database : 'user'
}

var sessionStore = new MySQLStore(options)


app.use(session({
secret : 'my key',
resave : false,
saveUninitialized: true, // 세션이 필요하면 세션을 실행시칸다(서버에 부담을 줄이기 위해)
store : sessionStore
}));

//-------------------------------------------------------------------------------------
var router = express.Router()
app.use(express.static(__dirname));
//app.use(express.static(__dirname + '/'));
app.use('/', router)

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'user',
    port: '3306',
  });

app.use(bodyParser.urlencoded({
  extended: false,
  }));
  
app.listen(3000, () => {
    // 데이터베이스 연결
  connection.connect();
  console.log('Server is running port 3000!');
  });
  
app.set('views', __dirname + '/views'); 
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', function(req, res){
  res.render('mainpage.ejs');//res.sendFile(__dirname+'/~.html')
});

app.get('/login', function(req, res, next){//로그인 겟 +세션
  let session =req.session;
  res.render('login.ejs',{
    session : session
  });
});

app.get('/regist', function(req, res){
  res.render('regist.ejs');
});
app.get('/template', function(req, res){
  res.render('template.ejs');
});

app.get('/template', function(req, res){
  res.render('template.ejs');
});



app.get('/program.html', function(req, res){
  res.sendFile(__dirname+'/views/program.html');
});





//회원가입

app.get('/newpage',logincheck, function(req, res){
  res.render('newpage.ejs');
});


app.post('/regist',(req,res)=>{
  console.log('회원가입 하는중')
  const body = req.body;
  const id = body.id;
  const pw = body.pw;
  const name = body.name;
  const phone = body.phone;
  const gender = body.gender;
  const email = body.email;
  connection.query('select * from user.user_tb where userid=?',[id],(err,data)=>{
      if(data.length == 0){
          console.log('회원가입 성공');
          connection.query('insert into user.user_tb(userid, name, phone, password, email) values(?,?,?,?,?)',[
              id, name, phone, pw, email]
              );
              res.send("<script>alert('회원가입하셨습니다. 다시 로그인하세요');location.href='/';</script>");
      }else{
          console.log('회원가입 실패');
          res.redirect('/login');
      }
  });
});

//---------------------------------------------------- 로그인

app.post('/login', function(req, res){
  const id = req.body.id
  const pw = req.body.pw
  var sql_insert = {id:id,pw:pw}
  connection.query('select * from user.user_tb where userid=?',[id],function(err,rows){
    if(rows.length){
      if(rows[0].userid==id){
        connection.query('select * from user.user_tb where password=?',[pw],function(err,rows){
          if(err){
            throw err
          }
          if(rows.length){
            res.cookie("userid", id , {
              expires: new Date(Date.now() + 900000),
              httpOnly: true
          });
            req.session.isLogined = true;
            req.session.uid=id
            req.session.upw=pw
            connection.query('select * from user.user_tb where userid=?',[req.session.uid],function(err,rows){
              req.session.uname = rows[0].name
            })
            req.session.save(function(){
              console.log(req.session.uid);
              console.log('로그인 성공');
              res.redirect('/newpage');
            })
          }else{
            console.log('비밀번호 오류입니다.');
            res.redirect('/login');
          }
        })
      }
    }
    else{
      console.log('아이디 오류입니다.');
      res.redirect('/login');
    }
  })
})
//----------------------------------------------로그아웃

app.get('/logout',function(req,res){
  console.log('로그아웃 성공');
  console.log(req.session)
  req.session.destroy(function(){
    res.redirect('/')
  });
});

//-----------------------------------------------로그인 유무 함수
function logincheck(req, res, next){ //마이페이지에 사용
  if(req.session){
      next()//있다면 통과
  }else{
      res.redirect('/login');
  }
}

function logincheck2(req, res, next){ 
  if(req.session){
      next()//있다면 통과
  }else{
      res.redirect('/listview');
  }
}

//--------------------------------------------로그인후 마이페이지 조회

app.get('/mypage', logincheck ,function(req, res){//mypage에 접속하면 로긴유무 함수 발동
  console.log(req.body);
  //res.render('mypage.ejs',{user : req.body})

  connection.query('select * from user.user_tb where userid=?',[req.session.uid],function(err,rows){
    console.log(req.session.uid);
    res.render('mypage.ejs', {'data' : rows[0]}, function(err ,html){
      if (err){
          console.log(err)
      }
      res.end(html) // 응답 종료
    })
  })
})

//-------------------------------------------------------------개인정보 수정
app.get('/mymodify',function(req,res){
  res.render('mymodify.ejs')
});//mypage 처럼 get 할수잇으면 get하게끔 수정


app.post('/mymodify',(req,res)=>{
  console.log('개인정보 수정')
  const body = req.body;
  const id = body.id;
  const pw = body.pw;
  const name = body.name;
  const phone = body.phone;
  const gender = body.gender;
  const email = body.email;
  connection.query('UPDATE user.user_tb SET name=?,password=?,phone=?,email=? WHERE userid =?' ,[
     name, pw, phone, email, req.session.uid],function(err,result,fields){
      if(err){
        console.log(err)
      }else{
        console.log("개인정보 수정 완료")
        res.redirect('/newpage');
      }
     }
    );
});

//-----------------------------------게시판


app.get('/listview',function(req, res){
  
  connection.query('select * from board',function(err, rows){
    console.log(rows)
    res.render('notice_list.ejs', {'data' : rows}, function(err ,html){
      if (err){
          console.log(err)
      }
      res.end(html) // 응답 종료
    })
  })
})

app.get('/loginlistview',function(req, res){
  
  connection.query('select * from board',function(err, rows){
    console.log(rows)
    res.render('login-notice_list.ejs', {'data' : rows}, function(err ,html){
      if (err){
          console.log(err)
      }
      res.end(html) // 응답 종료
    })
  })
})


//-----------------------------
app.get('/noticeview/:i',function(req,res){
  var pages = req.params.i
 connection.query('select * from board',function(err,rows){
      if(err){throw err;}
      res.render("notice_view.ejs",{'data':rows[pages]},function(err3,html){
      if(err3){
          throw err3;
          }
          res.end(html)
      })
      })
})

app.get('/loginnoticeview/:i',function(req,res){
  var pages = req.params.i
 connection.query('select * from board',function(err,rows){
      if(err){throw err;}
      res.render("login-notice_view.ejs",{'data':rows[pages]},function(err3,html){
      if(err3){
          throw err3;
          }
          res.end(html)
      })
      })
})
//------------------------------------------- 게시판 생성
app.get('/boardcreate',function(req,res){
  res.render('boardcreate.ejs')
});


app.post('/boardcreate',logincheck2, function(req,res){
  const paramsName = req.session.uname;
  const paramUser = req.session.uid;
  const paramContent = req.body.contents;
  const paramTitle = req.body.title;
  const params = [paramTitle,paramContent,paramUser,paramsName];
  var sql = 'INSERT INTO board (title,content,userid,writer) VALUES(?,?,?,?)';
  
  connection.query(sql,params,function(err,rows,fields){
      if(err) console.log(err);
      res.redirect('/loginlistview')
  })
})
//-------------------------------------------------------게시판 삭제
app.get('/boarddelete/:writer', logincheck2 ,function(req,res){
  var [writer,title] = req.params.writer.split(',')
  if(writer === req.session.uid){
      connection.query('DELETE FROM board WHERE title = ?',title,function(err,rows){
          if(err){throw err;}
          res.send("<script>alert('게시글 삭제 성공');location.href='/loginlistview';</script>");
      })
  }
  else{
      res.send("<script>alert('작성자가 일치하지 않습니다.');location.href='/loginlistview';</script>");
  }
})
//-------------------------------------------------게시판 수정
app.get('/boardmodify/:writer',function(req, res){
  var [writer,title] = req.params.writer.split(',')
  if(writer === req.session.uid){
    connection.query('select * from user.board where userid=?',[req.session.uid],function(err,rows){
      console.log(req.session.uid);
    if (err){throw err}
      res.render("notice_view_modify.ejs",{'data':rows[0]},function(err3,html){
        if(err3){
            throw err3;
            }
            res.end(html)
        })
  })
  } 
  else{
    res.send("<script>alert('작성자가 일치하지 않습니다.');location.href='/loginlistview';</script>");
  }
})

app.post('/boardmodify/:writer',function(req,res){

  const body = req.body;
  const title = body.title;
  const content = body.contents;

  connection.query('UPDATE user.board SET title=?,content=? WHERE userid =?' ,[
    title, content, req.session.uid],function(err,result,fields){
     if(err){
       console.log(err)
     }else{
       console.log("수정 완료")
       res.redirect('/loginlistview');
     }
    }
   );
})
