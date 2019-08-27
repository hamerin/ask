firebase.initializeApp({
  apiKey: "AIzaSyBgB1D6MpNL1dSvSqbpis2ytD2MeNg9b9o",
  authDomain: "ask-himyu-bd649.firebaseapp.com",
  databaseURL: "https://ask-himyu-bd649.firebaseio.com",
  projectId: "ask-himyu-bd649",
  storageBucket: "",
  messagingSenderId: "349705051204",
  appId: "1:349705051204:web:2c44a638ae3740e7"
});

let db = firebase.firestore();

function randInt(from, to) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

$(document).ready(function () {
  $("body").addClass(`c${randInt(1, 4).toString()}`)

  particlesJS.load('particles-js', 'assets/particles.json', function () {
    let SHA256 = new Hashes.SHA256;
    let vue_ask = new Vue({
      el: '#question_form',
      data: {
        question: ""
      },
      methods: {
        update_question: function () {
          $('#question_form > button').html('<i class="paper plane icon"></i>질문 제출하기 (' + this.question.length.toString() + '/140자)');
          if (this.question.length > 140) {
            $('#question_form > .field').addClass("error");
            $('#question_form > button').addClass("disabled");
          } else {
            $('#question_form > .field').removeClass("error");
            $('#question_form > button').removeClass("disabled");
          }
        },
        submit_question: function () {
          $('#question_form').removeClass("success");
          $('#question_form').removeClass("error");

          let submit_data = this.question.replace(/^\s+/, '').replace(/\s+$/, '');

          if (submit_data === '' || this.question.length > 140) {
            $('#question_form').addClass("error");
            return;
          }

          $('#question_form > button').html('<div class="ui active centered inline small loader"></div>');

          let now = moment.now()
          db.collection("Ask").doc(now.toString()).set({
            content: submit_data,
            answer: "아직 답변되지 않았어요 ㅠㅠ...",
            isAnswered: false,
            timestamp: moment(now).locale("ko").format('lll')
          }).then(function () {
            vue_ask.question = "";
            $('#question_form textarea').val("");
            $('#question_form').addClass("success");
          }).catch(function (error) {
            console.error(error);
          });
        }
      },
      watch: {
        question: function () {
          this.update_question();
        }
      }
    });

    let vue_list = new Vue({
      el: '#answer_container',
      data: {
        question_list: []
      }
    });

    db.collection("Ask").onSnapshot(function (querySnapshot) {
      let promises = [];
      querySnapshot.forEach(element => {
        promises.push(db.collection("Ask").doc(element.id).get());
      });
      vue_list.question_list = [];
      Promise.all(promises.reverse()).then(function (results) {
        results.forEach(element => {
          vue_list.question_list.push(element.data());
        });
      });
    });
  });
});