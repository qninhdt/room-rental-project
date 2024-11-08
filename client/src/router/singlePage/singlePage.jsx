import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map.jsx";
import "./singlePage.scss";
// import { singlePostData, userData } from "../../lib/dummydata";
import { useLoaderData, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify"; //npm i dompuify làm sạch các file scrip từ quill hay draw trước khi đưa vào app
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import apiRequest from "../../lib/apiRequest.js";

function SinglePage() {
  const post = useLoaderData();
  const { currentUser } = useContext(AuthContext);
  const [saved, setSaved] = useState(post.isSaved);
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);

  const handleSave = async () => {
    setSaved((prev) => !prev);
    if (!currentUser) {
      navigate("/login");
    }

    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };

  // const handleChat = async () => {
  //   if (!currentUser) {
  //     navigate("/login");
  //     return;
  //   }
  //   try {
  //     const res = await apiRequest.post("/chats", {
  //       currentUserId: currentUser.id,
  //       userId: post.userId, // id của người đăng bài
  //     });
  //     // Nếu đã có hoặc vừa tạo cuộc trò chuyện, chuyển người dùng đến giao diện chat
  //     setChat(res.data.chat);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const receiverId = post.userId;

  const handleChat = async () => {
    try {
      const res = await apiRequest.post("/chats", { receiverId }); // Gửi ID của người nhận
      console.log("Chat created or found:", res.data); // Xử lý dữ liệu trả về
      setChat(res.data.chat);
    } catch (err) {
      console.error("Failed to create chat", err);
    }
  };

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="adress">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price}</div>
              </div>
              <div className="user">
                <img src={post.user.avatar} alt="" />
                <span>{post.user.username}</span>
              </div>
            </div>
            <div
              className="bottom"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.desc),
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                {post.postDetail.utilities === "owner" ? (
                  <p>Owner is responsible</p>
                ) : (
                  <p>Tenant is responsible</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                {post.postDetail.pet === "allowed" ? (
                  <p>Pets allowed</p>
                ) : (
                  <p>Pets not allowed</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Room Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} bedroom</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title"> Nearby place </p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>
                  {post.postDetail.school >= 1000
                    ? (post.postDetail.school / 1000).toFixed(1) + "km"
                    : post.postDetail.school + "m"}{" "}
                  away
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/bus.png" alt="" />
              <div className="featureText">
                <span>Bus stop</span>
                <p>{post.postDetail.bus}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/restaurant.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{post.postDetail.restaurant}m away</p>
              </div>
            </div>
          </div>

          <p className="title">Location</p>
          <p className="title"></p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
            <button onClick={handleChat}>
              <img src="/chat.png" alt="" />
              Send a message
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: saved ? "#fece51" : "white",
              }}
            >
              <img src="/save.png" alt="" />
              {saved ? "Place Saved" : "Save the place"}
            </button>
          </div>

          {chat && (
            <div className="chatBox">
              <div className="top">
                <div className="user">
                  <img src="/noava.png" alt="" />
                  Nguoiban
                </div>
                <span className="close" onClick={() => setChat(null)}>
                  X
                </span>
              </div>
              <div className="center">
                <div className="chatMessage"></div>
              </div>
              <form className="bottom">
                <textarea name="text"></textarea>
                <button>Send</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
