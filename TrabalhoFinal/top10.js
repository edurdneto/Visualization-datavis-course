var entries, table, hashtags, a;
        var TOGGLE_PLAY=true, PLAY_SOUND=true;
        var sediBarChart;
        var nb_previous_day,nb_previous_week,nb_all;
        var min_time, max_time
        var INCREMENT_UPDATE = 1000000;

        function set_current_time(t) {
            sediBarChart.selectAll().flocculate();
            current_time = t;
            prev_time = current_time;
            sediBarChart.strata.update(sediBarChart);
        }

        d3.xml("datasets/tweets.xml", function(xml) {

          entries = d3.select(xml).selectAll("tweet")[0];
          console.log(entries);
          hashtags = d3.keys(d3.nest()
            .key(function(d) {return d3.select(d).select("hashtag")[0][0].textContent;})
            .map(entries));

          console.log(hashtags);
          min_time = d3.min(entries, function(data) {
            return Date.parse(d3.select(data).select("date")[0][0].textContent);
          });
      

          max_time = d3.max(entries, function(data) {
            return Date.parse(d3.select(data).select("date")[0][0].textContent);
          }); 

          current_time=min_time;
          last_time=current_time;   

          // Adding one extra day to make the tokens disappear
          max_time += 1000 * 60 * 60 * 27;
            
          var max_size =  d3.max(entries, function(data) {
            return parseInt(d3.select(data).select("size")[0][0].textContent);
          });

          var token_scale = d3.scale.linear().domain([0, max_size])
                               .rangeRound([2, 20]);//mySettings.width/sediBarChart.settings.data.model.length]);

          var nb_commits=[];

          entries.map(function (data) {
            var t = hashtags.indexOf(d3.select(data).select("hashtag")[0][0].textContent);
            if(typeof(nb_commits[t]) == 'undefined')
                nb_commits[t] = 0;
              nb_commits[t]++;
          });
                      
          max_commits =  d3.max(nb_commits, function(data) {
            return data;
          });

         // nb_last_hour=init_array(hashtags.length+1);
          nb_previous_day=init_array(hashtags.length+1);
          nb_previous_week=init_array(hashtags.length+1)
          nb_all=init_array(hashtags.length+1);

          sediBarChart = chart_sedivn(xml);
          distribBarChart = chart_distribution(xml);

        // MAIN LOOP
        function update(once) {


          if(typeof once == "undefined")
            once = false;

          if(current_time > max_time)
            return;


          if((TOGGLE_PLAY || once) && current_time <= max_time) {



            d3.select("#current_time") //text(new Date(current_time));
            .text(function() {
              var ct = current_time - (max_time - 1 * 1000 * 60 * 60 * 26);

              var cd = 1+ct/(1000 * 60 * 60 * 24);
          
              var ch = 24-(cd-Math.floor(cd))*24;

              var sh="s", sd="s", leftover="left";

              if(ct>0) {
                cd--;
                ch=Math.abs(24-ch);
                leftover = "over";
              } 
              if(ch<2) sh = "";
              if(cd<2) sd = "";

              return Math.abs(Math.floor(cd)) +" day"+sd+" "+Math.floor(ch)+" hour"+sh+" "+leftover;
          });

          current_time+=INCREMENT_UPDATE;

          //nb_last_hour=init_array(hashtags.length+1);
          nb_previous_day=init_array(hashtags.length+1);
          nb_previous_week=init_array(hashtags.length+1);
          nb_all=init_array(hashtags.length+1);

          var this_day = current_time - 1000 * 60 * 60* 24;
          var previous_day = this_day - 1000 * 60 * 60 * 24;
          var previous_week = previous_day - 1000 * 60 * 60 * 24 * 7;

          // UPDATE TIME WINDOW
          d3.select(".window").attr("width", x(new Date(current_time)));
          d3.select("#current_time").attr("x", function() {
            var pos_x = x(new Date(current_time));
            if(pos_x < 400) {
              return pos_x;
            } else {
              return pos_x-100;
            }
          });

          //d3.select("#relative_time").attr("x", function() { return d3.select("#current_time").attr("x");})

          // REMOVE TOKENS OLDER THAN ONE DAY OLD
          for(var c=0; c<sediBarChart.settings.data.model.length; c++) {
            var tks = sediBarChart.selectAll("category", c);
            for(var t=0; t<tks.length; t++) {
              if(tks[t].attr("t") < this_day)
                tks[t].flocculate();
            }
          }

          entries.filter(function(d, i) {

            var dt = Date.parse(d3.select(d).select("date")[0][0].textContent);
            var cat = hashtags.indexOf(d3.select(d).select("hashtag")[0][0].textContent);

            if((dt<current_time) && (dt>=last_time)) {

              // ADD TOKEN FOR EACH NEW COMMIT
              sediBarChart.addToken({
                t:dt,
                category: cat,
                size: token_scale(parseInt(d3.select(d).select("size")[0][0].textContent)),
              }); 

              // PLAY SOUND IF ENABLED
              // if(PLAY_SOUND)
              //   _sndCollection[sound_scale(parseInt(d3.select(d).select("size")[0][0].textContent))].play();
              
              // APPEND TO LOG LIST
              $("#logs ul").prepend(
                $('<li style="font-size:8px; line-height:10px">').append("<span style='color:lightgray'>["+d3.select(d).select("date")[0][0].textContent+"]</span> "+d3.select(d).select("hashtag")[0][0].textContent + ": " + d3.select(d).select("msg")[0][0].textContent+"").delay(1000).fadeOut(1500, function() {})
              );   

              // HIGHLIGHT COLUMN TEXT
              d3.select(".coltext_"+cat).style("font-size", 10).transition().duration(1000).style("font-size", 10);

            } else if( (dt<this_day) && (dt>=previous_day)) {
              nb_previous_day[cat]++;
            } else if( (dt<previous_day) && (dt>=previous_week)) {
              nb_previous_week[cat]++;
            } else if( (dt<previous_week) )
              nb_all[cat]++;
//            else
  //            nb_last_all[cat]++;
          });
          last_time=current_time;
        }
      }

     sp = new StreamPlayer('simple-stream-player', {
          auto_start: true,
          current_time: function() { 
          },
          current_speed: 50,
          current_step: 100000,
          max_time: 0,
          updateCallback: function(a) {
            sediBarChart.strata.update(sediBarChart);
            update(a);
          },
          refreshCallback: function() {
          },
          playCallback: function() {
            TOGGLE_PLAY = !TOGGLE_PLAY
            d3.select("#btn-playpause").text("Pause  ").on("click", sp.pauseCallback)//.style("width", "60px");
            d3.select("#btn-playpause").append("i").attr("class", "icon-pause").style("margin-left", "0px");

          },
          pauseCallback: function() {
            TOGGLE_PLAY = !TOGGLE_PLAY;
            d3.select("#btn-playpause").text("Start  ").on("click", sp.playCallback)//.style("width", "60px");
            d3.select("#btn-playpause").append("i").attr("class", "icon-play").style("margin-left", "5.5px");
            //d3.select(".icon-pause").on("click", sp.playCallback)
          },
          soundCallback: function() {
            PLAY_SOUND = !PLAY_SOUND;
            if(PLAY_SOUND) {
              d3.select("#btn-sound").text("Sound").on("click", sp.soundCallback)
              d3.select("#btn-sound").append("i").attr("class", "icon-volume-up").style("margin-left", "5.5px");
            } else {
              d3.select("#btn-sound").text("Sound").on("click", sp.soundCallback)
              d3.select("#btn-sound").append("i").attr("class", "icon-volume-off").style("margin-left", "5.5px");
            }
          }
        });

        // INIT
        d3.select("#btn-playpause").on("click", sp.pauseCallback)
        d3.select("#btn-sound").on("click", sp.soundCallback)
        d3.select("#btn-repeat").on("click", function() {
          set_current_time(min_time);
          self.updateCallback(true);
        })

    });