import React, { useEffect } from 'react';
import { Card, Col, Row, Spin, List, Input, Button, ConfigProvider, theme } from 'antd';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useOutletContext } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments, addReply, setReplyInput, clearReplyInput } from '../../../redux/reducers/CommentSlice';
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.css';

const { TextArea } = Input;
const { useToken } = theme;

const AdminComments = () => {
  const { isDarkMode } = useOutletContext();
  const dispatch = useDispatch();
  const { comments, loading, error, replyInputs } = useSelector((state) => state.comments);

  useEffect(() => {
    dispatch(fetchComments());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  const handleReplyChange = (commentId, value) => {
    dispatch(setReplyInput({ commentId, value }));
  };

  const handleAddReply = (commentId) => {
    const replyContent = replyInputs[commentId];
    if (!replyContent || !replyContent.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    dispatch(addReply({ commentId, content: replyContent })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(clearReplyInput({ commentId }));
        toast.success('Phản hồi đã được thêm!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    });
  };

  const CustomComponent = () => {
    const { token } = useToken();
    return (
      <div style={{ padding: token.paddingLG, background: isDarkMode ? token.colorBgBase : '#f0f2f5' }}>
        <Spin spinning={loading} tip="Đang tải bình luận..." size="large">
          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24}>
              <Card
                title="Quản lý bình luận"
                style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadow }}
                headStyle={{
                  background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                  color: '#fff',
                  borderTopLeftRadius: token.borderRadiusLG,
                  borderTopRightRadius: token.borderRadiusLG,
                }}
                hoverable
              >
                <List
                  dataSource={comments}
                  renderItem={(comment) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div>
                            <strong>{comment.userName}</strong> (Sản phẩm ID: {comment.productId}) -{' '}
                            {moment(comment.createdAt).format('DD/MM/YYYY HH:mm')}
                          </div>
                        }
                        description={
                          <>
                            <p>{comment.content}</p>
                            {comment.reply ? (
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
                                  background: isDarkMode ? '#2f2f2f' : '#f0f5ff',
                                }}
                              >
                                <p>{comment.reply.content}</p>
                              </Card>
                            ) : (
                              <div style={{ marginTop: token.marginSM }}>
                                <TextArea
                                  rows={2}
                                  value={replyInputs[comment.id] || ''}
                                  onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                  placeholder="Viết phản hồi của bạn..."
                                  style={{ marginBottom: token.marginSM }}
                                />
                                <Button type="primary" onClick={() => handleAddReply(comment.id)}>
                                  Gửi phản hồi
                                </Button>
                              </div>
                            )}
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1a73e8',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          colorBgContainer: isDarkMode ? '#2f2f2f' : '#ffffff',
          colorText: isDarkMode ? '#e6e6e6' : '#000000',
        },
        components: {
          Card: { headerBg: isDarkMode ? '#1f1f1f' : '#1a73e8', headerFontSize: 18, headerHeight: 48 },
        },
      }}
    >
      <CustomComponent />
    </ConfigProvider>
  );
};

export default AdminComments;