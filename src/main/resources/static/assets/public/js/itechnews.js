$(document).ready(function () {
    //setup ajax csrf
    let token = $("meta[name='_csrf']").attr("content");
    let header = $("meta[name='_csrf_header']").attr("content");
    //console.log(token);
    //console.log(header);
    $(document).ajaxSend(function(e, xhr, options) {
        xhr.setRequestHeader(header, token);
    });

    //backtotop
    $(window).scroll(function(){
        if ($(this).scrollTop() > 100) {
            $('#scroll').fadeIn();
        } else {
            $('#scroll').fadeOut();
        }
    });
    $('#scroll').click(function(){
        $("html, body").animate({ scrollTop: 0 }, 600);
        return false;
    });




    //auto height comment box
    $('body').on('keyup', '.comment-box', function(e) {
        let o = $(this)[0];
        //console.log(o.scrollHeight);
        o.style.height = "1px";
        o.style.height = (30 + o.scrollHeight)+"px";
    });

    $('body').on('keypress', '.comment-box', function(e) {
        let $box = $(this); //textarea
        if(e.which === 13 && !$box.hasClass('comment-box-edit')) {
            e.preventDefault();
            let $totalOfComments = $('.total-of-comments');
            let postId = $('.post-comments').data('post-id');
            let commentContent = $box.val();
            let parentCommentId = $box.data('parent-comment-id');
            if (parentCommentId===undefined)
                parentCommentId = null;

            $.ajax({
                url: '/api/comment',
                type: 'POST',
                cache: false,
                data: {
                    content: commentContent,
                    parentCommentId: parentCommentId,
                    postId: postId
                },
                success: function(response){
                    if (parentCommentId === null) {
                        let $commentContainerClone = $('.comment-container-clone');
                        let $newCommentContainer = $commentContainerClone.clone();


                        $newCommentContainer.css('display', '');
                        $newCommentContainer.removeClass('comment-container-clone');
                        $newCommentContainer.find('p').html(response.data.content);
                        $newCommentContainer.find('span.time').html(response.data.created_at);
                        console.log($newCommentContainer.find('textarea'));
                        $newCommentContainer
                            .find('textarea')
                            .attr('data-parent-comment-id', response.data.id);
                        $newCommentContainer.find('ul.dropdown-menu').attr('data-comment-id', response.data.id);

                        $commentContainerClone.after($newCommentContainer);
                        $box.val('');

                        let total = parseInt($totalOfComments.text()) + 1;
                        $totalOfComments.text(total);
                        $('div.views h3').text(total);
                    } else {
                        let $commentReplyClone = $('.comment-reply-clone');
                        let $newReplyContainer = $commentReplyClone.clone();


                        $newReplyContainer.css('display', '');
                        $newReplyContainer.removeClass('comment-reply-clone');
                        $newReplyContainer.find('p').html(response.data.content);
                        $newReplyContainer.find('span.time').html(response.data.created_at);
                        $newReplyContainer.find('ul.dropdown-menu').attr('data-comment-id', response.data.id);

                        $box.closest('.comment-container-parent')
                            .find('.comment-container-reply')
                            .before($newReplyContainer)
                            .find('textarea').val('');

                        let total = parseInt($totalOfComments.text()) + 1;
                        $totalOfComments.text(total);
                        $('div.views h3').text(total);
                    }
                },
                error: function (){
                    console.log("ajax error");
                }
            });
        }
    });

    $('body').on('click', 'a.reply', function(e) {

        e.preventDefault();
        if ($('input#isAuthenticated').val() === '0') {
            alert("Vui lòng đăng nhập");
            return;
        }
        let $reply = $(this);
        let replyToUser = $reply.parent().find('h4').text();

        $reply
            .closest('.comment-container-parent')
            .find('.comment-container-reply')
            .css('display', 'block')
            .find('textarea')
            .val('@' + replyToUser + ' ').focus();

    });

    //like a post
    $('#like-post').click(function (e) {
        e.preventDefault();
        let $btnLike = $(this);
        let postId = $btnLike.data('post-id');
        let liked = $btnLike.hasClass('liked');

        $.ajax({
            url: '/api/post',
            type: 'POST',
            cache: false,
            data: {
                postId: postId,
                liked: liked
            },
            success: function(response){
                //console.log(response);
                if (response.message === 'OK') {
                    if (liked) { //unlike
                        $btnLike.attr('title','Thích');
                        $btnLike.removeClass('liked');
                        $btnLike.removeClass('animated bounce');
                    } else { //like
                        $btnLike.attr('title','Đã thích');
                        $btnLike.addClass('animated bounce');
                        $btnLike.addClass('liked');
                    }
                    $('.post-info .likes h3').text(response.data.total_post_likes);
                } else if (response.message === 'authentication') {
                    alert("Vui lòng đăng nhập");
                }
            },
            error: function (){
                console.log("ajax error");
            }
        });
    });

    $('body').on('click', '.comment-delete', function(e) {
        e.preventDefault();
        let $btnDelete = $(this);
        let commentId = $btnDelete.parent().parent().data('comment-id');

        $.ajax({
            url: '/api/comment',
            type: 'DELETE',
            cache: false,
            data: {
                commentId: commentId
            },
            success: function(response){
                console.log(response);
                if (response.message === 'OK') {
                    $btnDelete.closest('.media').remove();
                }
            },
            error: function (){
                console.log("ajax error");
            }
        });
    });

    $('body').on('click', '.comment-edit', function(e) {
        e.preventDefault();
        let $btnEdit = $(this);
        let commentId = $btnEdit.parent().parent().data('comment-id');
        let $comment = $btnEdit.closest('.media').find('>.media-body>p');
        let commentContent = $comment.text();
        console.log(commentContent);
        let x = `<textarea class="input comment-box comment-box-edit" data-comment-id="${commentId}" name="message" placeholder="Bình luận">${commentContent}</textarea>`;
        $comment.replaceWith(x);
    });

    $('body').on('keypress', '.comment-box-edit', function(e) {
        let $box = $(this);
        if(e.which === 13) {
            e.preventDefault();
            let commentId = $box.data('comment-id');
            let content = $box.val();

            $.ajax({
                url: '/api/comment',
                type: 'PUT',
                cache: false,
                data: {
                    content: content,
                    commentId: commentId
                },
                success: function(response){
                    $box.replaceWith(`<p>${response.data.content}</p>`);
                },
                error: function (){
                    console.log("ajax error");
                }
            });
        }
    });

    //follow button
    $('.btn-follow').click(function (e) {
        e.preventDefault();
        if ($('input#isAuthenticated').val() === '0') {
            alert("Vui lòng đăng nhập");
            return;
        }

        let $btn = $(this);
        let isFollowing = false;
        if ($btn.hasClass('btn-follow-following')) {
            isFollowing = true;
        } else {
            isFollowing = false;
        }

        console.log('follow');
        $.ajax({
            url: '/api/user/follow',
            type: 'POST',
            cache: false,
            data: {
                isFollowing: isFollowing,
                followedId: $('input[name=userId]').val()
            },
            success: function(response){
                console.log(response);
                if ($btn.hasClass('btn-follow-following')) {
                    isFollowing = true;
                    $btn.removeClass('btn-follow-following').find('span').text('Theo dõi');
                } else {
                    isFollowing = false;
                    $btn.addClass('btn-follow-following').find('span').text('Đang theo dõi');
                }
            },
            error: function (){
                console.log("ajax error");
            }
        });
    });
});