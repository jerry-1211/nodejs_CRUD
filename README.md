# node_WEB_project
Node.js 를 이용해 로그인, 회원가입, 게시판 기능 <br/>
Node.js, MYSQL 사용<br/>

![image](https://user-images.githubusercontent.com/86454797/209308889-089aa15d-e3b9-419c-96c8-933af1dcbd7a.png)

FRONT- end<br/>
Tourlist in tour 프론트엔드로 구성<br/>
이미지 슬라이드 기능과, 팝업기능 구현<br/>

BACK-end<br/>

--구현 기능--<br/>
회원가입 :regist.ejs와 연결되어 regist.ejs페이지에 입력된 정보들을 post로 받아와 데이터베이스에 삽입<br/>
로그인 :login.ejs에입력된 ID와 password를 post로 받아와 데이터베이스에 검색하여 일치하는 정보가 있을 경우 로그인하며 ID와 password를 세션에 저장<br/>
마이페이지 :세션에 저장된 ID를 조건으로 데이터베이스에서 해당ID의 정보를 가져와 mypage.ejs에 표현.<br/>
내정보수정 :회원가입과 유사한 방식으로 변경할 정보를 mypage_modify.ejs에서 입력받아세션에 저장된 ID의 정보를 갱신<br/>
로그아웃 :현재 세션에 저장된 내용을 destroy하며 비로그인 시의 mainpage.ejs로 이동<br/>
문의하기 :boardcreate.ejs에서 입력받은 내용을 board테이블에 INSERT<br/>
공지사항 : board테이블에 있는 모든 정보들을 받아와 인덱스 순으로 notice_list.ejs, login-notice_list.ejs에 나타냄.<br/>
공지사항 글 확인 :notice_list.ejs, login-notice_list.ejs의 게시글 인덱스를 받아와 인덱스를 기준으로 board테이블의 정보를 list_view.ejs와 login-list_view.ejs로 가져옴.<br/>
글 수정 : login-list_view.ejs의 작성자의 ID와 제목을 req.params로 받아 작성자ID가 세션에 저장되어있는ID와 같을 경우 제목을 기준으로 내용을 수정하여 데이터베이스에 갱신<br/>
글 삭제 : login-list_view.ejs의 작성자의 ID와 제목을 req.params로 받아 작성자ID가 세션에 저장되어있는ID와 같을 경우 제목을 기준으로 글 삭제<br/>
