/* eslint-disable require-jsdoc */
/* eslint-disable camelcase */
/* global promiseWrapper */ // <- ./lib/promiseWrapper.js must be loaded

$(function onLoad() {
  // pageのロードが終わった時
  // TODO: chrome拡張機能のapiでもok?

  console.log('[moodle assistant for NITech] page: ' + location.href);

  // オプションを読み込んで対応する処理を行う
  (async () => {
    const options = await promiseWrapper.runtime.sendMessage({ item: 'loadOptions' });
    console.log('response options: ', options);
    console.log(options.backgroundColor);
    $('body').css('background-color', options.backgroundColor); // 背景色変更

    // ナビゲーションを非表示にして、動画表示サイズを大きくする(動画視聴時のみ…？)
    if (
      options.hideNavOnVideo === true &&
      location.href === 'https://cms6.ict.nitech.ac.jp/moodle38a/mod/scorm/player.php'
    ) {
      $('#page-content.blocks-pre').addClass('hidedenNavigation');
    }
  })();

  // TODO
  const topPageUrl = /^https:\/\/cms6.ict.nitech.ac.jp\/moodle38a\/my\/(#|(index.php))?/;
  if (topPageUrl.test(location.href)) {
    // topページでの処理
    onTopPage();
  } else {
    // topページ以外での処理
    outTopPage();
  }

  // 処理終了イベント発火
  window.dispatchEvent(new Event('extensionPreprocessFinished'));
});

function onTopPage() {
  // topページでの処理
  const reload = () => {
    const courseValue = $('.coursename');
    if (isUndefined(courseValue[0])) {
      console.log('yet');
      setTimeout(reload, 500);
    } else {
      console.log('done');
      reformTopPage(courseValue.length);
      // TODO:
      console.log('value: ', courseValue.length, courseValue);
    }
  };

  reload();
}

function outTopPage() {
  // topページ以外での処理
  (async () => {
    const courses = (await promiseWrapper.storage.local.get('courses')).courses;
    const coursenum = courses.length;
    // ナビゲーション文字入れ替え
    const listnum = $('.depth_1 ul').first().children('li').eq(2).children('ul').children('li').length;
    let count = 0;

    $('.depth_1 ul')
      .first()
      .children('li')
      .eq(2)
      .children('ul')
      .children('li')
      .each(function () {
        let tf = false;
        count++;
        for (let i = 0; i < coursenum; i++) {
          if ($(this).children('p').children('a').text() == courses[i].short) {
            $(this).children('p').children('a').text(courses[i].name);
            tf = true;
          }
        }
        if (tf === false) {
          if (count == listnum) {
            // トップに戻るボタン
            $(this).children('p').children('a').text('マイページに戻る');
          } else {
            $(this).remove();
          }
        }
      });
  })();
}

async function reformTopPage(courseSize) {
  // 読み込み終わったらの処理
  // todolistの作成(取得?)

  const courses = convertAndLoadCourses(courseSize);

  // ストレージに保持(local->syncで他拡張機能と共有可能?)
  // awaitする必要はない
  promiseWrapper.storage.local.set({ courses: courses });

  // nav: ページ上部にあるトップページとかマイページへのリンクがある領域
  // navバー操作
  // $('nav').prepend('<p>Hello Moodle</p>');

  // naviを左に集める＆順番最適化
  // nagi: もともとmoodleページの右側にあるコース検索・マイシラバスなどを集めた領域
  moveNaviToLeft();

  const search_course = $('[data-block="html"]').last();
  // let jyouhou_security=$("[data-block=\"html\"]").first()
  const navigator = $('[data-block="navigation"]');
  const mysyllabus = $('[data-block="mysyllabus"]');
  const private_files = $('[data-block="private_files"]');
  const calendar_upcoming = $('[data-block="calendar_upcoming"]');
  const badges = $('[data-block="badges"]');
  const calendar_month = $('[data-block="calendar_month"]');

  $('#block-region-side-post').empty();
  $('#block-region-side-pre').remove();
  $('#block-region-side-post').append(
    calendar_month,
    calendar_upcoming,
    navigator,
    search_course,
    mysyllabus,
    private_files,
    badges,
  );

  // メインの時間割とか
  $('#page').append(
    // TODO
    '<!-- インテリセンスを使うためだけに生まれた悲しいHTML --><div id="main_extension"style="position:absolute; top:100px; left:400px; width: calc(100vw - 450px); background-color: #f8f9fa; border-radius:3px ;"><div id="content_extension" style="padding: 16px;"><h1 style="font-size:18.75px; font-weight: medium;">時間割・授業</h1><div style="display: flex; margin: 50px 50px;"><div style="background-color: #e9ecef; border-radius: 3px; padding: 16px;"><h1 style="font-size:18.75px; font-weight: medium;"><span class="extension_delete">今日(</span><span id="classtable_extension_term">NaN</span>期<span id="classtable_extension_day">NaN</span>曜日<span class="extension_delete">)</span>の時間割<select name="term_select_extension" id="term_select_extension"><option value="前">前期</option><option value="後">後期</option></select><select name="day_select_extension" id="day_select_extension"><option value="1">月曜日</option><option value="2">火曜日</option><option value="3">水曜日</option><option value="4">木曜日</option><option value="5">金曜日</option><option value="6">週刊表示</option></select></h1><table style="border-collapse: collapse" id="classtable_extension"><tr><td style="height:90px">1限<br>8：50～9：35</td><td rowspan="2" id="onegen_extension"></td></tr><tr><td style="height:90px">2限<br>9：35～10：20</td></tr><tr><td style="height:20px">休憩<br>10：20～10：30</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">3限<br>10：30～11：15</td><td rowspan="2" id="threegen_extension"></td></tr><tr><td style="height:90px">4限<br>11：15～12：00</td></tr><tr><td style="height:120px">昼休み<br>12：00～13：00</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">5限<br>13：00～13：45</td><td rowspan="2" id="fivegen_extension"></td></tr><tr><td style="height:90px">6限<br>13：45～14：30</td></tr><tr><td style="height:20px">休憩<br>14：30～14：40</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">7限<br>14：40～15：25</td><td rowspan="2" id="sevengen_extension"></td></tr><tr><td style="height:90px">8限<br>15：25～16：10</td></tr><tr><td style="height:20px">休憩<br>16：10～60：20</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">9限<br>16：20～17：05</td><td rowspan="2" id="ninegen_extension"></td></tr><tr><td style="height:90px">10限<br>17：05～17：50</td></tr></table></div><div style="background-color: #e9ecef; border-radius: 3px; padding: 16px;"><h1 style="font-size:18.75px; font-weight: medium;">今日やるべきこと</h1><table id="today_todo_extension"><tr><td id="task_done_extension">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr></table></div><div style="background-color: #e9ecef; border-radius: 3px; padding: 16px;"><h1 style="font-size:18.75px; font-weight: medium;">時間割外のクラス</h1><table id="special_class_extension"><tr><td>登録されていないようです。</td></tr></table></div></div></div></div>',
  );

  // events: moodleトップページにある「直近イベント」。moodleトップページの、eventクラスがついた部分のarray。
  // 直近イベントを見やすくする
  const events = calendar_upcoming
    .children('div')
    .children('div')
    .children('div')
        .first()
    .children('div')
    .children('div');

  for (let i = 0; i < events.length; i++) {
    $(events[i]).children('.date').append('');
    $(events[i]).children('.date').append('<br>残り時間 ： <span class="date-left-extension">計算中</span>');
  }

  // 次の処理と同じ: let todolist = isUndefined(data_todolist.todolist) ? [] : data_todolist.todolist;
  await removeOldToDo(events);
  const todolist = (await promiseWrapper.storage.local.get('todolist')).todolist || [];
  const now_day = (new Date()).getDay();
  console.log(todolist);

  const term_now = getCurrentTermLetter(); // 時間割表の「前期」「後期」のセレクトボックスの初期値(リロードした時の表示される値)を指定
  if (term_now == '前') {
    $('#term_select_extension option').eq(0).prop('selected', true);
  } else {
    $('#term_select_extension option').eq(1).prop('selected', true);
  }

  drawClasses(term_now, now_day, courses, todolist);

  // 時間割外のクラスを追加
  drawSpecialClasses(courses);

  // 動的に残り時間を変更
  // TODO:
  let oldmin;
  let newmin;

  setInterval(async () => {
    const now_date = new Date();
    oldmin = newmin;
    newmin = now_date.getMinutes();

    if (oldmin == newmin) return;

    // 分が変わっていれば表示を初期化
    $('.date-left-extension').empty();

    // 各eventに対して、残り時間と、期限(日時?時間?)を取得
    for (let i = 0; i < events.length; i++) {
      // task_date_txt:
      // YYYY年 0n月 nn日, 23:59<br>残り時間 ： n日 n時間 n分
      const taskDueDateString = $(events[i]).children('.date').text();
      const taskDueDate = taskDateStringToDate(taskDueDateString, now_date);

      // 残り時間を表示
      if(0 < taskDueDate - now_date && taskDueDate - now_date < 60000){
        $($('.date-left-extension')[i]).text('1分以下');
      }else{
        $($('.date-left-extension')[i]).text(msToTime(taskDueDate - now_date + 60000));
      }

      if (taskDueDate - now_date < 86400000) {
        // 1日を切っている場合
        // 文字を赤くする
        $($('.date-left-extension')[i]).addClass('deadline');
        // ToDoリストに追加
        addToToDoList(todolist, events[i], taskDueDate - now_date);
      }
    }

    // todoを更新
    refleshTodo(todolist);
  }, 1000);

  $('#link-to-calendar').attr('href', $('.current').eq(1).children('a').attr('href'));
}

/**
 * 今日が前期か後期か取得します。
 * @param {Date} today 今日
 * @return {String} 前期なら前, 後期なら後を返す
 */
function getCurrentTermLetter(today) {
  // TODO: 実装はまだない
  // if (("MM-DD"))
  return '後';
}

async function removeOldToDo(events){
  // 古いtodoを削除
  const todolist = (await promiseWrapper.storage.local.get('todolist')).todolist || [];

  const newTodolist = todolist.filter(function (element) {
    let exists = false;
    if (!element.time.match(/-/)) {
      for (let i = 0; i < events.length; i++) {
        if ($(events[i]).children('a').text() == element.name) {
          exists = true;
        }
      }
    } else {
      exists = true;
    }
    return exists;
  });

  await promiseWrapper.storage.local.set({ todolist: newTodolist });
}

function taskDateStringToDate(taskDueDateString, nowDate){
  // task_due_date: Array
  //   [YYYY, MM, DD, hh, mm (, 余り)] or
  //   [明日, hh, mm (, 余り)] or [本日, hh, mm (, 余り)]
  const arr = taskDueDateString.replace(/[\s+,]/g, '').split(/[:年日月残]/);
  let year = 0;
  let month = 0;
  let day = 0;
  let hour = 0;
  let minute = 0;

  if(arr[0] == '本'){
    // 本日, hh:mm
    year = nowDate.getFullYear();
    month = nowDate.getMonth();
    day = nowDate.getDate();
    hour = arr[1];
    minute = arr[2];
  }else if(arr[0] == '明'){
    // 明日, hh:mm
    year = nowDate.getFullYear();
    month = nowDate.getMonth();
    day = nowDate.getDate() + 1;
    hour = arr[1];
    minute = arr[2];
  }else{
    // YYYY年 MM月 DD日, hh:mm
    year = arr[0];
    month = arr[1] - 1;
    day = arr[2];
    hour = arr[3];
    minute = arr[4];
  }

  return new Date(year, month, day, hour, minute);
}

function addToToDoList(todolist, event, remainingTime) {
  // イベントをToDoリストに追加

  // ToDoリスト内を検索
  const existToDoItem = todolist.some(item => item.name === $(event).children('a').text());

  if (isUndefined(existToDoItem)) {
    // ToDoリストに新規追加
    todolist.push({
      name: $(event).children('a').text(),
      time: msToTime(remainingTime),
      url: $(event).children('a').attr('href'),
      complete: false,
    });
  } else {
    // リストのアイテムを書き換え
    existToDoItem.time = msToTime(remainingTime);
    existToDoItem.url = $(event).children('a').attr('href');
  }
}

function refleshTodo(todolist) {
  console.log('reflesh todo');
  console.log(todolist);

  $('#today_todo_extension').empty();

  let todo_remain = false;
  for (let i = 0; i < todolist.length; i++) {
    if (todolist[i].complete == false) {
      todo_remain = true;
    }
  }

  if (todo_remain == true) {
    $('#today_todo_extension').append(
      '<tr><td id="task_done_extension">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr>',
    );
  } else {
    $('#today_todo_extension').append(
      '<tr><td id="task_done_extension">今日のやるべきことはすべて終了しました🎊<br>💮お疲れさまでした💮</td></tr>',
    );
  }

  for (let i = 0; i < todolist.length; i++) {
    const todolist_index = i;
    // todolistの中身を確認して、
    if (todolist[i].time.match(/-/)) {
      // 時間割の授業(n-n')のとき (つまり、timeに-があるとき)
      $('#today_todo_extension').append(
        '<tr><td><h1 style="font-size:18.75px; font-weight: medium;">授業<button data-index_extension="' +
          todolist_index +
          '" class="todo_button_extension" type="button">完了する</button></h1><span class="strike_todo_extension">' +
          todolist[i].name +
          '<br>時間 ： ' +
          timetableToTime(todolist[i].time) +
          '</span><br><a href="' +
          todolist[i].url +
          '">この授業のページに移動する</a></td></tr>',
      );
    } else {
      // 直近イベントから取得した課題のとき (timeが上以外のとき)
      $('#today_todo_extension').append(
        '<tr><td><h1 style="font-size:18.75px; font-weight: medium;">課題<button data-index_extension="' +
          todolist_index +
          '" class="todo_button_extension" type="button">完了する</button></h1><span class="strike_todo_extension">' +
          todolist[i].name +
          '<br>残り時間 ： <span style="color:red">' +
          todolist[i].time +
          '</span></span><br><a href="' +
          todolist[i].url +
          '">この課題の提出先に移動する</a></td></tr>',
      );
    }

    if (todolist[i].complete == true) {
      // console.log($("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension"))
      // console.log($("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").parent())
      $('#today_todo_extension tr')
        .last()
        .children('td')
        .children('h1')
        .children('.todo_button_extension')
        .parent()
        .parent()
        .animate({ opacity: '0.6' }, 100);
      $('#today_todo_extension tr')
        .last()
        .children('td')
        .children('h1')
        .children('.todo_button_extension')
        .text('未完了に戻す');
      $('#today_todo_extension tr')
        .last()
        .children('td')
        .children('h1')
        .children('.todo_button_extension')
        .parent()
        .parent()
        .children('.strike_todo_extension')
        .wrap('<s>');
    }
  }

  $('.todo_button_extension').click(function () {
    if ($(this).parent().parent().css('opacity') == '1') {
      $(this).parent().parent().animate({ opacity: '0.6' }, 100);
      $(this).text('未完了に戻す');
      $(this).parent().parent().children('.strike_todo_extension').wrap('<s>');
      todolist[$(this).attr('data-index_extension')].complete = true;
      chrome.storage.local.set({ todolist: todolist }, function () {});
    } else {
      $(this).parent().parent().animate({ opacity: '1.0' }, 100);
      $(this).text('完了する');
      $(this).parent().parent().children('s').children('.strike_todo_extension').unwrap();
      todolist[$(this).attr('data-index_extension')].complete = false;
      chrome.storage.local.set({ todolist: todolist }, function () {});
    }
    let todo_remain = false;
    for (let i = 0; i < todolist.length; i++) {
      if (todolist[i].complete == false) {
        todo_remain = true;
      }
    }
    if (todo_remain == true) {
      $('#today_todo_extension tr').first().remove();
      $('#today_todo_extension').prepend(
        '<tr><td id="task_done_extension">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr>',
      );
    } else {
      $('#today_todo_extension tr').first().remove();
      $('#today_todo_extension').prepend(
        '<tr><td id="task_done_extension">今日のやるべきことはすべて終了しました🎊<br>💮お疲れさまでした💮</td></tr>',
      );
    }
  });
}

function moveNaviToLeft() {
  $('#page-header').after('<div id="side-nav-extension"></div>');

  $('#side-nav-extension').append($('.columnleft').html());
  $('.columnleft').remove();

  $('#side-nav-extension').append($('.columnright').html());
  $('.columnright').remove();
}

// TODO: bugの原因か？ issue#12
function reformNavi(courseSize, courses) {
  // ナビゲーション文字入れ替え
  const listnum = $('.depth_1 ul').first().children('li').eq(2).children('ul').children('li').length;

  let count = 0;
  // ナビゲーション(表)の最初の要素に対して、
  $('.depth_1 ul')
    .first() /* ダッシュボード */
    .children('li')
    .last() /* マイコース */
    .children('ul')
    .children('li')
    .each(function () {
      /* マイコースの要素 */
      let success = false; // TODO: 関数に落とし込む
      count++;

      for (let i = 0; i < courseSize; i++) {
        if ($(this).children('p').children('a').text() == courses[i].short) {
          // 授業名(コース名)がshort(授業番号)の表示だったら、授業名に書き換え
          $(this).children('p').children('a').text(courses[i].name);
          success = true;
          console.log('replaced');
        }
      }

      if (success === false) {
        if (count == listnum) {
          // トップに戻るボタン
          $(this).remove();
        } else {
          $(this).remove();
        }
      }
    });
}

// TODO: 関数名
/**
 * DOMからコースの情報courselist, courselist_short(取得してきたcourseの要素達)を抜いて、courseに変換する。
 *
 * @param {int} courseSize たぶん
 * @return {Array} courses
 */
function convertAndLoadCourses(courseSize) {
  const courses = new Array(courseSize);
  const courselist_short = $('.course-listitem .text-muted div').text().slice(1).split('|');

  const courselist = $('.course-listitem .coursename').text().replace(/\s+/g, '').split('コース星付きコース名');
  courselist.shift();

  console.log($('.course-listitem .coursename').first().attr('href'));

  const short = new Array(courseSize);
  const term = new Array(courseSize);
  const day = new Array(courseSize);
  const name = new Array(courseSize);
  const time = new Array(courseSize);
  const url = new Array(courseSize);

  for (let i = 0; i < courseSize; i++) {
    short[i] = courselist_short[i]; // TODO: !?
    courselist_short[i] = String(20) + courselist_short[i].replace(/-/g, ''); // constなのに！？ <- 配列なので書き換えできる

    const courseContainerArray = courselist[i].split(courselist_short[i]);
    // ["授業名", "(前/後)期(月/...)曜(n-n')限_cls"]
    // TODO:
    console.log('courseContainer0: ', courseContainerArray);

    if (courseContainerArray.length == 1) {
      // 特殊なクラス(時間割じゃないコース)
      // 'none'ではなく「nilでもnullでもundefinedでもfalse」←ここらへんにしたい気がする。
      term[i] = 'none';
      name[i] = courseContainerArray[0];
      time[i] = 'none';
      url[i] = $('.course-listitem .coursename').eq(i).attr('href');
    } else {
      // 通常クラス
      name[i] = courseContainerArray[0];

      // TODO: ここ絶対キレイに書ける
      courseContainerArray[1] = courseContainerArray[1].split('期');
      console.log('courseContainer[1] ', courseContainerArray[1]);
      term[i] = courseContainerArray[1].shift();

      courseContainerArray[1] = courseContainerArray[1][0].split('曜');
      console.log(courseContainerArray[1]);
      day[i] = courseContainerArray[1].shift();

      console.log(courseContainerArray[1]);
      courseContainerArray[1] = courseContainerArray[1][0].split('限');
      time[i] = courseContainerArray[1].shift();

      url[i] = $('.course-listitem .coursename').eq(i).attr('href');
    }

    courses[i] = {
      term: term[i],
      name: name[i],
      day: day[i],
      short: short[i],
      time: time[i],
      url: url[i],
    };
  }
  return courses;
}

function drawSpecialClasses(courses) {
  let special_exists = false;
  $('#special_class_extension').empty();
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].time == 'none') {
      special_exists = true;
      $('#special_class_extension').append(
        '<tr><td>' + courses[i].name + '<br><a href="' + courses[i].url + '">この授業のページに移動する</a></td></tr>',
      );
    }
  }
  if (special_exists == false) {
    $('#special_class_extension').append('<tr><td>登録されていないようです。</td></tr>');
  }
}

// TODO:
function drawClasses(term_now, now_day, courses, todolist) {
  $('#classtable_extension_term').text(term_now);
  $('#day_select_extension option')
    .eq(now_day - 1)
    .prop('selected', true);

  now_day = ['日', '月', '火', '水', '木', '金', '土'][now_day];

  $('#classtable_extension_day').text(now_day);

  const set = [false, false, false, false, false];

  // TODO: forとifのネストがやばい
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].term == term_now) {
      if (courses[i].day == now_day) {
        if (todolist != undefined) {
          let already_exixsts_todo = false;
          for (let j = 0; j < todolist.length; j++) {
            if (todolist[j].name == courses[i].name) {
              already_exixsts_todo = true;
            }
          }

          if (already_exixsts_todo == false) {
            todolist.push({
              time: courses[i].time,
              name: courses[i].name,
              url: courses[i].url,
              complete: false,
            });
          }
        }
        switch (courses[i].time) {
          // TODO: これが時間割の根本部分！
          case '1-2':
            $('#onegen_extension').text(courses[i].name);
            $('#onegen_extension').append('<br><a href="' + courses[i].url + '">この授業のページに移動する</a>');
            set[0] = true;

            break;
          case '3-4':
            $('#threegen_extension').text(courses[i].name + '\n');
            $('#threegen_extension').append('<br><a href="' + courses[i].url + '">この授業のページに移動する</a>');
            set[1] = true;
            break;
          case '5-6':
            $('#fivegen_extension').text(courses[i].name + '\n');
            $('#fivegen_extension').append('<br><a href="' + courses[i].url + '">この授業のページに移動する</a>');
            set[2] = true;
            break;
          case '7-8':
            $('#sevengen_extension').text(courses[i].name + '\n');
            $('#sevengen_extension').append('<br><a href="' + courses[i].url + '">この授業のページに移動する</a>');
            set[3] = true;
            break;
          case '9-10':
            $('#ninegen_extension').text(courses[i].name + '\n');
            $('#ninegen_extension').append('<br><a href="' + courses[i].url + '">この授業のページに移動する</a>');
            set[4] = true;
            break;
        }
      }
    }
  }

  // TODO: ifのネストがやばい
  // todoリストにあるけどクラスにないもの消去(昨日の授業)
  if (todolist != undefined) {
    const new_todolist = todolist.filter(function (element) {
      let exists = false;
      if (element.time.match(/-/)) {
        for (let j = 0; j < courses.length; j++) {
          if (courses[j].term == term_now) {
            if (courses[j].day == now_day) {
              if (courses[j].name == element.name) {
                exists = true;
              }
            }
          }
        }
      } else {
        exists = true;
      }
      return exists;
    });

    todolist = new_todolist;

    chrome.storage.local.set({ todolist: todolist }, function () {
      // todoを追加
      for (let i = 0; i < todolist.length; i++) {
        const todolist_index = i;
        if (todolist[i].time.match(/-/)) {
          $('#today_todo_extension').append(
            '<tr><td><h1 style="font-size:18.75px; font-weight: medium;">授業<button data-index_extension="' +
              todolist_index +
              '" class="todo_button_extension" type="button">完了する</button></h1><span class="strike_todo_extension">' +
              todolist[i].name +
              '<br>時間 ： ' +
              timetableToTime(todolist[i].time) +
              '</span><br><a href="' +
              todolist[i].url +
              '">この授業のページに移動する</a></td></tr>',
          );
        } else {
          $('#today_todo_extension').append(
            '<tr><td><h1 style="font-size:18.75px; font-weight: medium;">課題<button data-index_extension="' +
              todolist_index +
              '" class="todo_button_extension" type="button">完了する</button></h1><span class="strike_todo_extension">' +
              todolist[i].name +
              '<br>残り時間 ： ' +
              todolist[i].time +
              '</span><br><a href="' +
              todolist[i].url +
              '">この課題の提出先に移動する</a></td></tr>',
          );
        }

        if (todolist[i].complete == true) {
          // console.log($("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension"))
          // console.log($("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").parent())
          $('#today_todo_extension tr')
            .last()
            .children('td')
            .children('h1')
            .children('.todo_button_extension')
            .parent()
            .parent()
            .animate({ opacity: '0.6' }, 100);
          $('#today_todo_extension tr')
            .last()
            .children('td')
            .children('h1')
            .children('.todo_button_extension')
            .text('未完了に戻す');
          $('#today_todo_extension tr')
            .last()
            .children('td')
            .children('h1')
            .children('.todo_button_extension')
            .parent()
            .parent()
            .children('.strike_todo_extension')
            .wrap('<s>');
        }
      }

      $('#day_select_extension').change(function () {
        console.log($('#day_select_extension').val());
        if ($('#day_select_extension').val() == 6) {
          // 週刊選択が一覧の場合の処理
          console.log('syuukan');
          $('body').append('<div id="overlay_extension"></div>');
          $('head').append(
            '<style>#overlay_extension::-webkit-scrollbar{width: 10px;}#overlay_extension::-webkit-scrollbar-track{background: #fff;border: none;border-radius: 10px;box-shadow: inset 0 0 2px #777;}#overlay_extension::-webkit-scrollbar-thumb{background: #ccc;border-radius: 10px;box-shadow: none;}</style>',
          );
          $('#overlay_extension').append(
            '<table style="border-collapse: collapse" id="classtable_extension_overlay"><tr><td style="height:90px">1限<br>8：50～9：35</td><td rowspan="2" id="onegen_extension_overlay"></td></tr><tr><td style="height:90px">2限<br>9：35～10：20</td></tr><tr><td style="height:20px">休憩<br>10：20～10：30</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">3限<br>10：30～11：15</td><td rowspan="2" id="threegen_extension_overlay"></td></tr><tr><td style="height:90px">4限<br>11：15～12：00</td></tr><tr><td style="height:120px">昼休み<br>12：00～13：00</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">5限<br>13：00～13：45</td><td rowspan="2" id="fivegen_extension_overlay"></td></tr><tr><td style="height:90px">6限<br>13：45～14：30</td></tr><tr><td style="height:20px">休憩<br>14：30～14：40</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">7限<br>14：40～15：25</td><td rowspan="2" id="sevengen_extension_overlay"></td></tr><tr><td style="height:90px">8限<br>15：25～16：10</td></tr><tr><td style="height:20px">休憩<br>16：10～60：20</td><td class="tenminyasumi"></td></tr><tr><td style="height:90px">9限<br>16：20～17：05</td><td rowspan="2" id="ninegen_extension_overlay"></td></tr><tr><td style="height:90px">10限<br>17：05～17：50</td></tr></table>',
          );
        }
        drawClasses($('#term_select_extension').val(), $(this).val(), courses);
        $('.extension_delete').empty();
      });
      $('#term_select_extension').change(function () {
        drawClasses($(this).val(), $('#day_select_extension').val(), courses);
        $('.extension_delete').empty();
      });

      $('.todo_button_extension').click(function () {
        if ($(this).parent().parent().css('opacity') == '1') {
          $(this).parent().parent().animate({ opacity: '0.6' }, 100);
          $(this).text('未完了に戻す');
          $(this).parent().parent().children('.strike_todo_extension').wrap('<s>');
          todolist[$(this).attr('data-index_extension')].complete = true;
          chrome.storage.local.set({ todolist: todolist }, function () {});
        } else {
          $(this).parent().parent().animate({ opacity: '1.0' }, 100);
          $(this).text('完了する');
          $(this).parent().parent().children('s').children('.strike_todo_extension').unwrap();
          todolist[$(this).attr('data-index_extension')].complete = false;
          chrome.storage.local.set({ todolist: todolist }, function () {});
        }
        let todo_remain = false;
        for (let i = 0; i < todolist.length; i++) {
          if (todolist[i].complete == false) {
            todo_remain = true;
          }
        }
        if (todo_remain == true) {
          $('#today_todo_extension tr').first().remove();
          $('#today_todo_extension').prepend(
            '<tr><td id="task_done_extension">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr>',
          );
        } else {
          $('#today_todo_extension tr').first().remove();
          $('#today_todo_extension').prepend(
            '<tr><td id="task_done_extension">今日のやるべきことはすべて終了しました🎊<br>💮お疲れさまでした💮</td></tr>',
          );
        }
      });
    });
  }

  for (let i = 0; i < set.length; i++) {
    if (set[i] == false) {
      switch (i) {
        case 0:
          $('#onegen_extension').addClass('blankClass');
          $('#onegen_extension').empty();
          break;
        case 1:
          $('#onegen_extension').addClass('blankClass');
          $('#threegen_extension').empty();
          break;
        case 2:
          $('#onegen_extension').addClass('blankClass');
          $('#fivegen_extension').empty();
          break;
        case 3:
          $('#onegen_extension').addClass('blankClass');
          $('#sevengen_extension').empty();
          break;
        case 4:
          $('#onegen_extension').addClass('blankClass');
          $('#ninegen_extension').empty();
          break;
      }
    }
  }
}

// ミリ秒から時間計算するやつ
function msToTime(duration) {
  if(duration < 0){
    return msToTime(-duration) + ' 超過しています';
  }

  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 365);

  if (days == 0) {
    if (hours == 0) {
      return minutes + '分';
    }
    return hours + '時間 ' + minutes + '分';
  }
  return days + '日 ' + hours + '時間 ' + minutes + '分';
}

// TODO: ここを書き換えれば issue#14 におおよそ対応できる?
// 時間割(n-n')から時間(hh:mm～hh:mm)にするやつ
function timetableToTime(timetable) {
  let truetime;
  switch (timetable) {
    case '1-2':
      truetime = '8：50～10：20';
      break;
    case '3-4':
      truetime = '10：30～12：00';
      break;
    case '5-6':
      truetime = '13：00～14：30';
      break;
    case '7-8':
      truetime = '14：40～16：10';
      break;
    case '9-10':
      truetime = '16：20～17：50';
      break;
  }
  return truetime;
}

function isUndefined(value) {
  return typeof value === 'undefined';
}
