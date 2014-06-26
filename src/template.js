/** @jsx React.DOM */
var converter = new Showdown.converter();
var CommentForm = React.createClass({
    handleSubmit: function() {
        var author = this.refs.author.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();
        if (!text || !author) {
            return false;
        }
        this.props.onCommentSubmit({author: author, text: text});
        this.refs.author.getDOMNode().value = '';
        this.refs.text.getDOMNode().value = '';
        return false;
    },
    render: function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Your name" ref="author" />
                <input type="text" placeholder="Say something..." ref="text" />
                <input type="submit" value="Post" />
            </form>
            );
    }
});
var Comment = React.createClass({
    render: function () {
        var rawMarkup = converter.makeHtml(this.props.children.toString());
        return (
            <div className="comment">
                <h2 className="commentAuthor">
          {this.props.author}
                </h2>
                <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
            </div>
            );
    }
});
var CommentList = React.createClass({
    render: function () {
        var renderComment = function (comment) {
            return <Comment author={comment.author}>{comment.text}</Comment>;
        };
        if(this){
            var comments = this.props.data.map(renderComment);
        }
        return (
            <div className="commentList">
                {comments}
            </div>
            );
    }
});
var CommentBox = React.createClass({
    getInitialState: function() {
        this.firebaseHandle = new Firebase(this.props.url);
        return {comments: [], firebaseHandle: this.firebaseHandle};
    },
    loadCommentsFromServer: function(commentsSnapshot) {
        var state = this.state;
        var comments = [];
        state.comments = commentsSnapshot.val().comments;
        for (var key in state.comments){
            comments.push(state.comments[key]);
        }
        state.comments = comments;
        this.setState(state);
    },
    handleCommentSubmit: function(comment) {
        var comments = this.state.comments;
        comments.push(comment);
        this.setState({comments: comments, firebaseHandle: this.state.firebaseHandle});
        this.state.firebaseHandle.child('comments').push(comment, function(error){
            if (error) {
                console.log('Data could not be saved.' + error);
            } else {
                console.log('Data saved successfully.');
            }
        });
    },
    componentWillMount: function() {
        var _this = this;
        this.state.firebaseHandle.on('value', function(commentsSnapshot){
            _this.loadCommentsFromServer(commentsSnapshot);
        });
    },
    render: function () {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.comments} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
            );
    }
});


React.renderComponent(
    <CommentBox url="https://fiery-fire-8885.firebaseio.com/" />,
    document.getElementById('content')
);
