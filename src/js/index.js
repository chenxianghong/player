// 数据接口
var dataUrl = '/data/data.json';

// 作用域
// jquery／zepto
// 但它是一个 jquery对象或者 zepto 对象的时候再去加
var $scope = $(document.body);

// audioData是从json去过来的
var AudioManager = function (audioData) {
    // 初始化，属性


    // 绑定数据 audioData
    this.dataList = audioData;
    // 索引
    this.index = 0;
   
    this.song0=audioData[0].song;
     this.song1=audioData[1].song;
      this.song2=audioData[2].song;
       this.song3=audioData[3].song;
 // 长度
    this.len = audioData.length;
    // audio 对象
    this.audio = new Audio();
    this.audio.src = audioData[0].audio;
    this.audio.preload = 'auto';
    // 时长等于第一首歌的时长
    this.duration = audioData[0].duration;
    // 标示当前切换时是否自动播放
    this.autoPlay = false;
    this.arr=[0,0,0,0];
};

   AudioManager.prototype = {

    // 播放下一首
    playNext: function () {
        this.index++;
        if (this.index === this.len) {
            this.index = 0;
        }
        // 播放
        this.setAudio();
    },
    // 播放上一首
    playPrev: function () {
        this.index--;
        if (this.index === -1) {
            this.index = this.len - 1;
        }
        // 播放
        this.setAudio();
    },
    // 播放指定的一首歌
    playIndex: function (index) {
        this.index = index;
        // 设置当前为自动播放
        this.autoPlay = true;
        // 播放
        this.setAudio();
    },
    //
    setAudio: function () {
        // 根据 index 获取到当前的歌曲数据
        var data = this.dataList[this.index];

        this.duration = data.duration;
        this.audio.src = data.audio;
        this.audio.load();

        if (this.autoPlay) {
            this.play();
        }
    },
    // play 方法
    play: function () {
        this.autoPlay = true;
        this.audio.play();
    },
    // pause 方法
    pause: function () {
        this.autoPlay = false;
        this.audio.pause();
    },

    // 获取当前歌曲信息
    getCurrentInfo: function () {
        return this.dataList[this.index];
    },

    // 获取当前播放百分比
    getPLayRatio: function () {
        return this.audio.currentTime / this.duration;
    },
    getCurrentTime: function (ratio) {
        var curTime;

        if (ratio) {
            curTime = ratio * this.duration;
        } else {
            curTime = this.audio.currentTime;
        }

        return Math.round(curTime);
    },

    jumpToPlay: function (ratio) {
        var time = ratio * this.duration;

        this.audio.currentTime = time;
        this.play();
    }
};

// 立即执行函数 渲染页面信息
var controlManager = (function () {
    var $songImg = $scope.find('.song-img img'),
        $songInfo = $scope.find('.song-info'),
        $songDuration = $scope.find('.all-time'),
        $curTime = $scope.find('.cur-time'),
        $proTop = $scope.find('.pro-top'),
        frameId,
        $playBtn = $scope.find('.play-btn');
        $listBtn = $scope.find('.list-btn');
        $likeBtn = $scope.find('.like-btn');
        $playList = $scope.find('.play-list');
        $closeBtn = $scope.find('.close-btn');
        $listHead = $scope.find('.list-head');
        $li=$scope.find('li');
        $ul=$scope.find('.ul');

    // 格式化时间
    function formatTime (duration) {
        var minute = Math.floor(duration / 60),
            second = duration - minute * 60;

        // 确保两位
        if (minute < 10) {
            minute = '0' + minute;
        }
        if (second < 10) {
            second = '0' + second;
        }

        return minute + ':' + second;
    }

    // 设置背景模糊图，放到外面，因为操作DOM费性能，每次换图片都要加载一遍
    function setImageBg (img) {
        // 设计专辑图片
        $songImg.attr('src', img.src);
        // 设置模糊背景
        blurImg(img, $scope.find('.content-wrap'));
    }

    // 设置歌曲信息
    function renderInfo (info) {
        var html = '<h1 class="song-name">' + info.song + '</h1>' +
            '<h3 class="singer-name">' + info.singer + '</h3>' +
            '<h3 class="album-name">' + info.album +'</h3>' +
            '<h3 class="rhythm">' + info.rhythm + '</h3>' +
            '<h3 class="lyric">' + info.lyric + '</h3>';
        

        $songInfo.html(html);
    }

    // 渲染页面信息
    function renderPage () {
        // 给audioManager一个获取数据的方法
        var curInfo = audioManager.getCurrentInfo();
        

        // 设置图片
        var image = new Image();

        image.onload = function () {
            setImageBg(this);
        };

        image.src = curInfo.image;

        // 设置歌曲信息
        renderInfo(curInfo);
        // 渲染歌曲时间
        $songDuration.text(formatTime(curInfo.duration));
        //渲染列表信息
       $scope.find('.1').text(audioManager.song0);
       $scope.find('.2').text(audioManager.song1);
       $scope.find('.3').text(audioManager.song2);
       $scope.find('.4').text(audioManager.song3);

      
    }
 

    // 绑定页面事件
    function addControlEvent () {
        // 播放按钮
        $playBtn.on('click', function () {
            var $this = $(this);

            if ($this.hasClass('playing')) {
                audioManager.pause();
                cancelAnimationFrame(frameId);
            } else {
                audioManager.play();
                setProgress();
            }
            $this.toggleClass('playing');
        });
        $scope.find('.prev-btn').on('click', function () {
            audioManager.playPrev();
            $scope.trigger('changeAudio');
        });
        $scope.find('.next-btn').on('click', function () {
            audioManager.playNext();
            $scope.trigger('changeAudio');
        });
        $scope.find('.like-btn').on('click', function () {
           
            if($(this).hasClass('checked')){
            audioManager.arr[audioManager.index] = undefined;
            // $(this).removeClass('checked');
            } else {
                 audioManager.arr[audioManager.index] = 1;
                 $(this).toggleClass('checked');
                
               
            }   

        
            
        });

//歌曲列表点击
       $scope.find('.list-btn').on('click',function(){
      
        $playList.hasClass('a')?$playList.removeClass('a').addClass('play-list'):$playList.removeClass('play-list').addClass('a');
        
        });
//列表关闭
$scope.find('.close-btn').on('click',function(){
    $playList.removeClass('a').addClass('play-list');
});
// 
$playList.on('click','li',function(){

    var self = $(this),
        index=self.data('index');
       
        //   $('.play-btn').addClass('playing');
        // self.siblings('.playing').removeClass('playing');
        // self.addClass('playing');
        if(self.hasClass('color')){
        self.removeClass('color').addClass('li');
        self.siblings('.color').removeClass('color').addClass('li');
         self.siblings('.playing').removeClass('playing');
       } else{
             self.addClass('color');
             // console.log('hi');
            // audioManager.playIndex(index);
           
            self.addClass('playing');
        }
      
      
        // $li.removeClass('li').addClass('color');
       //  $scope.find('.1').text(audioManager.song0);
       // $scope.find('.2').text(audioManager.song1);
       // $scope.find('.3').text(audioManager.song2);
       // $scope.find('.4').text(audioManager.song3);
            
        })
    }
      //播放列表




    function setProTopTranslate (percent) {
        var val;

        if (percent !== 0) {
            val = percent + '%';
        }

        $proTop.css({
            transform: 'translateX(' + val + ')',
            '-webkit-transform': 'translateX(' + val + ')'
        });
    }








    // 设置播放进度条
    function setProgress () {
        cancelAnimationFrame(frameId);
        var frame = function () {
            // console.log('hi');
            var ratio = audioManager.getPLayRatio(),
                transparentPercent = (ratio - 1) * 100,
                time = formatTime(audioManager.getCurrentTime());

            $curTime.text(time);

            if (ratio <= 1) {
                // 设置转换 transform
                setProTopTranslate(transparentPercent);
                frameId = requestAnimationFrame(frame);
            } else {
                setProTopTranslate(0);
                cancelAnimationFrame(frameId)
            }
        };

        frame();
    }

    // reset progress
    function resetProgress () {
        setProTopTranslate(-100);
        $curTime.text('00:00');
    }

    // 绑定进度条小球touch事件
    function bindProgressEvent () {
        var $slidePoint = $scope.find('.slide-point'),
            offset = $scope.find('.pro-wrap').offset(),
            offsetX = offset.left,
            width = offset.width;

        $slidePoint.on('touchstart', function () {
            //console.log('start');

        }).on('touchmove', function (e) {
            //console.log('move');
            var x = e.changedTouches[0].clientX - offsetX,
                ratio = x / width,
                translatePercent = (ratio - 1) * 100,
                time = formatTime(audioManager.getCurrentTime(ratio));
            if (ratio > 1 || ratio < 0) {
                return false;
            }

            $curTime.text(time);

            setProTopTranslate(translatePercent);
        }).on('touchend', function (e) {
            var ratio = (e.changedTouches[0].clientX - offsetX) / width;

            audioManager.jumpToPlay(ratio);

            $playBtn.addClass('playing');
        });
    }

    function init () {
        renderPage();
        addControlEvent();
        bindProgressEvent();

        $scope.on('changeAudio', function () {
            renderPage();

            // 如果是播放的状态
            if (audioManager.autoPlay) {
                setProgress();
            } else {
                // 重置进度条
                resetProgress();
            }
        })
    }

    return {
        init: init
    }
})();
// 通过构造函数去管理
var audioManager;

var success = function (d) {
    audioManager = new AudioManager(d);
    controlManager.init();
    //audioManager.playIndex(1);
};

function getData(url, cb) {
    $.ajax({
        url: url,
        type: 'GET',
        success: cb,
        error: function () {
            alert('hi');
        }
    });
}

getData(dataUrl, success);