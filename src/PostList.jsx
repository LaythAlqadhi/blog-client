import React, { useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";

function Comments({ postId }) {
  const { token } = useAuth();
  const [comment, setComment] = useState({ text: "" });
  const [data, setData] = useState({ get: null, post: null });
  const [error, setError] = useState({ get: null, post: null });
  const [loading, setLoading] = useState({ get: true, post: false });
  const [edit, setEdit] = useState({ isEditing: false, _id: null });
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://blog-restful-api.adaptable.app/v1/posts/${postId}/comments`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : null,
          },
        });

        if (response.status >= 400) {
          throw new Error("Server Error");
        }

        const result = await response.json();
        setData({ ...data, get: result });
      } catch (err) {
        setError((prevError) => ({ ...prevError, get: err }));
      } finally {
        setLoading((prevLoading) => ({ ...prevLoading, get: false }));
      }
    };

    fetchData();
  }, [token, postId]);

  const handleAddButton = async () => {
    try {
      setLoading((prevLoading) => ({ ...prevLoading, post: true }));

      const response = await fetch(`https://blog-restful-api.adaptable.app/v1/posts/${postId}/comments`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          text: comment.text,
        }),
      });

      if (response.status >= 400) {
        throw new Error("Server Error");
      }

      const result = await response.json();
      setData((prevData) => {
        if (prevData.get) {
          return {
            ...prevData,
            get: [...prevData.get, result],
          };
        }
        return {
          ...prevData,
          get: [result],
        };
      });
    } catch (err) {
      setError((prevError) => ({ ...prevError, post: err }));
    } finally {
      setComment({ text: "" });
      setLoading((prevLoading) => ({ ...prevLoading, post: false }));
    }
  };

  const handleDeleteButton = async (commentId) => {
    let deletedComment;

    const updatedData = data.get.filter((d) => {
      if (d._id !== commentId) {
        deletedComment = d;
      }
      return d._id !== commentId;
    });
    try {
      setLoading((prevLoading) => ({
        ...prevLoading,
        delete: true,
      }));

      setData((prevData) => ({
        ...prevData,
        get: updatedData,
      }));

      const response = await fetch(`https://blog-restful-api.adaptable.app/v1/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status >= 400) {
        throw new Error(`Failed to delete comment. Status: ${response.status}`);
      }
    } catch (err) {
      setData((prevData) => ({
        ...prevData,
        get: prevData.get ? [...prevData.get, deletedComment] : [deletedComment],
      }));

      setError((prevError) => ({
        ...prevError,
        delete: err,
      }));
    } finally {
      setLoading((prevLoading) => ({
        ...prevLoading,
        delete: false,
      }));
    }
  };

  const handleEditButton = (currentComment) => {
    setEdit({ ...edit, isEditing: true, _id: currentComment._id });

    setComment((prevComment) => ({
      ...prevComment,
      text: currentComment.text,
    }));

    inputRef.current.focus();
  };

  const handleSaveEditButton = async () => {
    const previousComment = data.get.find((d) => d._id === edit._id);

    try {
      setLoading((prevLoading) => ({
        ...prevLoading,
        edit: true,
      }));

      const updatedData = data.get.map((d) => (d._id === edit._id ? { ...d, text: comment.text } : d));

      setData((prevData) => ({
        ...prevData,
        get: updatedData,
      }));

      const response = await fetch(`https://blog-restful-api.adaptable.app/v1/posts/${postId}/comments/${edit._id}`, {
        method: "PUT",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commentId: edit._id,
          text: comment.text,
          post: postId,
        }),
      });

      if (response.status >= 400) {
        throw new Error(`Failed to delete comment. Status: ${response.status}`);
      }
    } catch (error) {
      const previousData = data.get.map((d) => (d._id === previousComment._id ? previousComment : d));

      setData((prevData) => ({
        ...prevData,
        get: previousData,
      }));

      setError((prevError) => ({
        ...prevError,
        edit: error,
      }));
    } finally {
      setComment({ text: "" });
      setEdit({ ...edit, isEditing: false, _id: null });
      setLoading((prevLoading) => ({
        ...prevLoading,
        edit: false,
      }));
    }
  };

  return (
    <div className="comments">
      {data.get ? (
        data.get.map((d) => (
          <div key={d._id} className="comment">
            <p>{d.user.username}</p>
            <p>{DateTime.fromJSDate(new Date(d.createdAt)).toFormat("yyyy/MM/dd")}</p>
            <p>{d.text}</p>
            <button onClick={() => handleDeleteButton(d._id)}>Delete</button>
            <button onClick={() => handleEditButton(d)}>Edit</button>
          </div>
        ))
      ) : loading.get ? (
        <p>🔄 loading the comments...</p>
      ) : (
        error.get && <p>⚠️ No comments yet</p>
      )}

      <input
        type="text"
        ref={inputRef}
        value={comment.text}
        onChange={(e) => {
          setComment({ text: e.target.value });
        }}
      />
      {edit.isEditing ? (
        <button type="submit" onClick={handleSaveEditButton}>
          Save
        </button>
      ) : (
        <button type="submit" onClick={handleAddButton}>
          Add
        </button>
      )}
    </div>
  );
}

function Post({ postId }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://blog-restful-api.adaptable.app/v1/posts/${postId}`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : null,
          },
        });

        if (response.status >= 400) {
          throw new Error("Server Error");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, token]);

  return data ? (
    <div key={data._id} className="post">
      <p>{data.user.username}</p>
      <p>{DateTime.fromJSDate(new Date(data.createdAt)).toFormat("yyyy/MM/dd")}</p>
      <h2>{data.title}</h2>
      <p>{data.text}</p>
      <Comments postId={data._id} />
    </div>
  ) : loading ? (
    <p>🔄 loading the post...</p>
  ) : (
    error && <p>⚠️ Cannot parse this post</p>
  );
}

function PostList() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://blog-restful-api.adaptable.app/v1/posts`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : null,
          },
        });

        if (response.status >= 400) {
          throw new Error("Server Error");
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="postList">
      {data && data.map((post) => <Post key={post._id} postId={post._id} />)}
      {!data && loading && <p>🔄 Loading the posts...</p>}
      {!data && !loading && error && <p>⚠️ No posts yet</p>}
    </div>
  );
}

Post.propTypes = {
  postId: PropTypes.string.isRequired,
};

Comments.propTypes = {
  postId: PropTypes.string.isRequired,
};

export default PostList;
