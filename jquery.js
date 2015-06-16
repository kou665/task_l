$(function () {
    $("#tab").tabs({
        active:0,
        beforeActivate: function(event, ui){
            var index = ui.newTab.index();
            if(check[index]){//関連記事を表示済みの場合はなにもしない
                return;
            }
            var category_name = ids[index];
            for(var i = 0;i<5;i++){
                var link = $("#"+category_name+String(i)+" a").attr("href");
                relatedPage(link,index,i);
            }
            check[index]=true;
        }
    });
})
var check =[true,false,false,false,false,false,false,false,false,false]
var ids = ["top", "dom", "int", "eco", "ent", "spo", "52", "gourmet", "love", "trend"]
var tab_categories = ["topics/rss/top", "topics/rss/dom", "topics/rss/int", "topics/rss/eco", "topics/rss/ent", "topics/rss/spo", "rss/summary/52", "topics/rss/gourmet", "topics/rss/love", "topics/rss/trend"]
google.load("feeds", "1");
function initialize(){
    //フィードの取得
    for (var index = 0; index < tab_categories.length; index++) {
        var feed = new google.feeds.Feed("http://news.livedoor.com/" + tab_categories[index] + ".xml");
        //エントリの表示数の設定
        feed.setNumEntries(5);
        feed.includeHistoricalEntries();
        //関数の定義
        (function (index) {
            feed.load(function (result, i) {
                if (!result.error) {
                    //読み込みが成功したときの処理
                    var container = document.getElementById(ids[index]);
                    var htmlstr = "";
                    for (var i = 0,result_feed_entries_length = result.feed.entries.length; i < result_feed_entries_length; i++) {
                        $("."+ids[index]).append("<div id="+ids[index]+i+"></div>")
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
                        imgsrc = entry.content.match(/(src="(http:|https:)){1}[\S_-]+((\.jpg)|(\.JPG)|(\.gif)|(\.png))"/);

                        //html生成
                        
                        htmlstr +='<div id='+ids[index]+i+'><a href="' + entry.link + '" target="_blank">';
                        if (imgsrc) {
                            htmlstr += '<div class="thum"><img ' + imgsrc + ' ></div>';
                        }else{ //画像がない場合
                            htmlstr += '<div class="thum"><img ' + "src='http://news.livedoor.com/img/fb/news.png?v=20131122'" + ' width="155" height="125"></div>';
                        }
                        htmlstr += '<p class="info">' + date + '</p>';
                        htmlstr += '<p class="tit">' + entry.title + '</p></a></div>';
                        //主要のみ関連を表示する。
                        if(index==0){
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
        var tags = $(data.responseText).find(".articleHeadKeyword  a").map(function () { return $(this).attr("href") } );
        //タグから一つずつ関連記事を載せる
        for (var i = 0; i<3 ; i++) {
            relatedNews(tags[i % tags.length],category,article_num);
        }
    });
}




function relatedNews(link,category,article_num) {
    $.get(link,function (data) {
        var articles = $(data.responseText).find(".articleList");
        var links = articles.find("a").map(function () {
            return $(this).attr("href")
        })
        var titles = articles.find("h3").map(function () {
            return $(this).text()
        })
        
        var related_articles = $("#"+ids[category]+article_num);
        
        var displayed = related_articles.find("p").map(function(){return $(this).text().replace(/関連記事:/g,"")});
        loop:for (var i = 0,links_length=links.length; i < links_length; i++) {
            var link = links[i];
            var title = titles[i];
            //すでに載っていれば飛ばす
            for(var j=0,displayed_length=displayed.length; j<displayed_length ; j++){
                if(title==displayed[j]) continue loop;
            }
            related_articles.append('<a href="'+link+'" target="_blank"><p><font size="2" color="Blue">'+"関連記事:"+title)
            return;
        }
    });
}



