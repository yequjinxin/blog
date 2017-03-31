$(function () {
    function setActive(obj) {
        obj.parent().find('a').each(function (index, element) {

            if ($(this).text() === obj.text()) {
                $(this).addClass('active');
            } else {
                $(this).removeClass('active');
            }
        });
        $('#my-breadcrumb .active').text(obj.text());
    }
    function  bindPostClick() {
        $('#post-list a').click(function () {
            var post = $(this).text().replace(/\n|\s*/g, '');
            var that = $(this);
            var type = $('#post-type').val();
            $.post('/getPost', {post: post, type: type}, function (data) {
                $('#post-content').html(data.content);
                // 重新渲染pretty code
                PR.prettyPrint();
                setActive(that);
                history.pushState({title: post, type: type}, '', location.href.split('?')[0] + '?' + post);

                DISQUS.reset({
                    reload: true,
                    config: function () {
                        this.page.identifier = $('#url').val() + '/#!' + type + '?' + post;
                        this.page.url = $('#url').val() + '/' + type + '?' + post;
                    }
                });
            }, 'json');
        });
    }
    bindPostClick();


    function naviClick(clickType, isHistory, callback) {
        $('#my-nav a').each(function (index, e) {
            var type = $(this).text();
            if (clickType === type) {
                $(this).addClass('active');
                $.post('/getType', {type: type}, function (data) {
                    // 博客导航
                    var str = '';
                    var len = data.post_list.length;
                    for (var i = 0; i < len; i++) {
                        str += '<a href="javascript:void(0)" class="list-group-item">' + data.post_list[i].name + '</a>';
                    }
                    $('#post-list').html(str);
                    if (len === 0) {
                        $('#post-list').removeClass('col-sm-3').addClass('col-sm-0');
                        $('#post-content').parent().removeClass('col-sm-9').addClass('col-sm-12');
                    } else {
                        $('#post-list').removeClass('col-sm-0').addClass('col-sm-3');
                        $('#post-content').parent().removeClass('col-sm-12').addClass('col-sm-9');
                    }
                    // 面包屑
                    $('#my-breadcrumb li').each(function (index) {
                        if (index === 0) {
                            $(this).html('<a href="/' + type + '">' + type + '</a>');
                        } else if (index === 1) {
                            $(this).text('welcome');
                        }
                    });
                    $('#post-type').val(type);
                    // 导航绑定点击事件
                    bindPostClick();
                    // 内容
                    $('#post-content').html(data.content);
                    PR.prettyPrint();
                    if (!isHistory) {
                        history.pushState({title: type, type: type}, '', type);
                    }
                    if (callback) {
                        callback();
                    } else {
                        DISQUS.reset({
                            reload: true,
                            config: function () {
                                this.page.identifier = $('#url').val() + '/#!' + type;
                                this.page.url = $('#url').val() + '/' + type;
                            }
                        });
                    }
                }, 'json');
            } else {
                $(this).removeClass('active');
            }
        });

    }

    $('#my-nav a').click(function () {
        naviClick($(this).text(), false);
    });



    function fnHashTrigger(event) {
        var query = decodeURI(location.href.split("?")[1]);
        var type = event.state.type;

        if (query === 'undefined') {
            naviClick(type, true);
        } else {
            $.post('/getPost', {post: query, type: type}, function (data) {
                naviClick(type, true, function () {
                    $('#post-content').html(data.content);
                    PR.prettyPrint();
                    $('#post-list a').each(function () {
                        if ($(this).text().replace(/\n|\s*/g, '') === query) {
                            $(this).addClass('active');
                        } else {
                            $(this).removeClass('active');
                        }
                    });
                    $('#my-breadcrumb li.active').text((query !== 'undefined') ? query : 'welcome');
                    DISQUS.reset({
                        reload: true,
                        config: function () {
                            this.page.identifier = $('#url').val() + '/#!' + type + '?' + query;
                            this.page.url = $('#url').val() + '/' + type + '?' + query;
                        }
                    });
                });
            }, 'json');
        }
    }

    window.addEventListener('popstate', function (event) {
        fnHashTrigger(event);
    });
});

