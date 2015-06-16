$(function () {
    $("#tab").tabs({
        active:0,
        beforeActivate: function(event, ui){
            var index = ui.newTab.index();
            if(check[index]){//関連記事を表示済みの場合はなにもしない
                return;
            }
            var category_name = ids[index];
            for(var i = 0;i<article_numbers;i++){
                var link = $("#"+category_name+String(i)+" a").attr("href");
                relatedPage(link,index,i);
            }
            check[index]=true;
        }
    });
});
var relatedNews_numbers=3;
var article_numbers=5;
var check =[];
var ids = ["top", "dom", "int", "eco", "ent", "spo", "52", "gourmet", "love", "trend"];
var tab_categories =ids.map(function(x){
    if(x==="52"){
        return "rss/summary/"+x;
    }else{
        return "topics/rss/"+x;
    }
});
google.load("feeds", "1");
function initialize(){
    //フィードの取得
    for (var index = 0; index < tab_categories.length; index++) {
        var feed = new google.feeds.Feed("http://news.livedoor.com/" + tab_categories[index] + ".xml");
        //エントリの表示数の設定
        feed.setNumEntries(article_numbers);
        feed.includeHistoricalEntries();
        //関数の定義
        (function (index) {
            feed.load(function (result) {
                if (!result.error) {
                    //読み込みが成功したときの処理
                    var container = document.getElementById(ids[index]);
                    var htmlstr = "";
                    for (var i = 0; i < result.feed.entries.length; i++) {
                        $("."+ids[index]).append("<div id="+ids[index]+i+"></div>");
                        var entry = result.feed.entries[i];
                        //日付の取得
                        var pdate = new Date(entry.publishedDate); //Dateクラス
                        var pyear = pdate.getFullYear(); //年
                        var pmonth = pdate.getMonth() + 1; //月
                        var pday = pdate.getDate(); //日

                        //日付を2桁表示に変更
                        if (pyear < 2000)
                            pyear += 1900;
                        if (pmonth < 10) {
                            pmonth = "0" + pmonth;
                        }
                        if (pday < 10) {
                            pday = "0" + pday;
                        }

                        var date = pyear + "." + pmonth + "." + pday + " ";

                        //画像の取得
                        imgsrc = entry.content.match(/(src="(http:|https:)){1}[\S_-]+((\.jpg)|(\.gif))"/);

                        //html生成
                        
                        htmlstr +='<div id='+ids[index]+i+'><a href="' + entry.link + '" target="_blank">';
                        if (imgsrc) {
                            htmlstr += '<div class="thum"><img ' + imgsrc + ' ></div>';
                        }else{ //画像がない場合
                            htmlstr += '<div class="thum"><img ' + "src='http://news.livedoor.com/img/fb/news.png?v=20131122'" + ' width="155" height="125"></div>';
                        }
                        htmlstr += '<p class="info">' + date + '</p>';
                        htmlstr += '<p class="tit">' + entry.title.trim() + '</p></a></div>';
                        //主要のみ関連を表示する。
                        if(index===0){
                            check[index]=true;
                            relatedPage(entry.link,index,i);
                        }
                        
                    }
                    container.innerHTML = htmlstr;
                } else {
                    //読み込みが失敗したときの処理
                    alert(result.error.code + ":" + result.error.message);
                }

            });
        })(index);
    }
}

google.setOnLoadCallback(initialize);


function relatedPage(link,category,article_num) {
    $.get(link,function (data) {
        //タグを一つずつ見る
        var tags = $(data.responseText).find(".articleHeadKeyword  a").map(function () { return $(this).attr("href"); } );
        //タグから一つずつ関連記事を載せる
        for (var i = 0; i<relatedNews_numbers ; i++) {
            relatedNews(tags[i % tags.length],category,article_num);
        }
    });
}




function relatedNews(link,category,article_num) {
    $.get(link,function (data) {
        var articles = $(data.responseText).find(".articleList");
        var links = articles.find("a:even").map(function () {
            return $(this).attr("href");
        });
        var titles = articles.find("h3").map(function () {
            return $(this).text();
        });
        
        var related_articles = $("#"+ids[category]+article_num);
        
        var displayed = related_articles.find("a").map(function(){
            return urlToID($(this).attr("href"));  
        }).get();
        for (var i = 0; i < links.length; i++) {
            var newlink = links[i];
            var compareLink = urlToID(newlink);
            var title = titles[i];
            if(displayed.indexOf(compareLink)>=0) continue ;
            
            related_articles.append('<a href="'+newlink+'" target="_blank"><p><font size="2" color="Blue">'+"関連記事:"+title);
            return;
        }
    });
}

function urlToID(x){
    var length = x.split("/").length;
    return x.split("/")[length-2];
}

