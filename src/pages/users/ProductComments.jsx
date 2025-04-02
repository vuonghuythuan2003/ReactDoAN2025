import { useEffect, useState } from 'react'; // Chỉ import các hook cần thiết
import { Card, Input, Button, List, Spin, ConfigProvider, theme } from 'antd';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import { getToken } from '../../api/index'; // Import getToken để lấy token từ cookies
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.css';

const { TextArea } = Input;
const { useToken } = theme;

const ProductComments = ({ productId }) => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/comments/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`, // Sử dụng getToken() thay vì localStorage
        },
      });
      setComments(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Không thể tải bình luận!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/comments',
        {
          productId,
          content: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`, // Sử dụng getToken() thay vì localStorage
          },
        }
      );
      setComments([...comments, response.data]);
      setNewComment('');
      toast.success('Bình luận đã được thêm!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Không thể thêm bình luận!', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const CustomComponent = () => {
    const { token } = useToken();
    return (
      <div style={{ padding: token.paddingLG }}>
        <Spin spinning={loading} tip="Đang tải bình luận..." size="large">
          <Card
            title="Bình luận"
            style={{
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadow,
            }}
            styles={{
              header: {
                background: '#1a73e8',
                color: '#fff',
                borderTopLeftRadius: token.borderRadiusLG,
                borderTopRightRadius: token.borderRadiusLG,
              },
            }}
          >
            <TextArea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              style={{ marginBottom: token.marginLG }}
            />
            <Button type="primary" onClick={handleAddComment}>
              Gửi bình luận
            </Button>

            <List
              style={{ marginTop: token.marginLG }}
              dataSource={comments}
              renderItem={(comment) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div>
                        <strong>{comment.userName}</strong> -{' '}
                        {moment(comment.createdAt).format('DD/MM/YYYY HH:mm')}
                      </div>
                    }
                    description={
                      <>
                        <p>{comment.content}</p>
                        {comment.reply && (
                          <Card
                            size="small"
                            title={
                              <div>
                                <strong>Phản hồi từ {comment.reply.adminName}</strong> -{' '}
                                {moment(comment.reply.createdAt).format('DD/MM/YYYY HH:mm')}
                              </div>
                            }
                            style={{
                              marginTop: token.marginSM,
                              background: '#f0f5ff',
                            }}
                          >
                            <p>{comment.reply.content}</p>
                          </Card>
                        )}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Spin>
      </div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1a73e8',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CustomComponent />
    </ConfigProvider>
  );
};

export default ProductComments;