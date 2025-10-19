import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../api/ticketService';
import { getProblemTypes } from 'features/problem-types/api/problemTypeService';
import { CreateTicketModel } from 'types/models';
import { ProblemType } from 'types/entities';
import {
  Container, Paper, Typography, Box, TextField, FormControl, InputLabel, Select,
  MenuItem, Button, Stack, Alert, CircularProgress, FormHelperText
} from '@mui/material';

const CreateTicketPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [problemTypeId, setProblemTypeId] = useState<number | ''>('');
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingTypes(true);
    getProblemTypes()
      .then(res => {
        if (res.succeeded) {
          setProblemTypes(res.data);
        } else {
          setError('Could not load problem types.');
        }
      })
      .catch(() => setError('Could not load problem types.'))
      .finally(() => setLoadingTypes(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !problemTypeId) {
      setError("Tiêu đề, mô tả, và loại vấn đề là bắt buộc.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      const ticketData: CreateTicketModel = { 
          title, 
          description, 
          priority, 
          problemTypeId: Number(problemTypeId) 
      };
      const response = await createTicket(ticketData);

      if (response.succeeded && response.data) {
        navigate(`/tickets/${response.data.ticketId}`);
      } else {
        setError(response.errors?.join(', ') || response.message || "Không thể tạo ticket.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi tạo ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tạo Ticket Hỗ trợ Mới
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Vui lòng cung cấp càng nhiều chi tiết càng tốt để chúng tôi có thể hỗ trợ bạn hiệu quả.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Stack spacing={3}>
            <TextField
              id="title"
              label="Chủ đề"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="VD: Không thể kết nối internet"
            />

            <FormControl fullWidth required>
              <InputLabel id="problem-type-label">Loại vấn đề</InputLabel>
              <Select
                labelId="problem-type-label"
                id="problem-type"
                value={problemTypeId}
                label="Loại vấn đề"
                onChange={(e) => setProblemTypeId(e.target.value as number)}
                disabled={loadingTypes}
              >
                {loadingTypes ? (
                  <MenuItem value=""><em>Đang tải...</em></MenuItem>
                ) : (
                  problemTypes.map(pt => (
                    <MenuItem key={pt.problemTypeId} value={pt.problemTypeId}>{pt.name}</MenuItem>
                  ))
                )}
              </Select>
              <FormHelperText>Chọn loại vấn đề để ticket được gửi đến đúng nhóm hỗ trợ.</FormHelperText>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="priority-label">Mức độ ưu tiên</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                value={priority}
                label="Mức độ ưu tiên"
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <MenuItem value="Low">Thấp</MenuItem>
                <MenuItem value="Medium">Trung bình</MenuItem>
                <MenuItem value="High">Cao</MenuItem>
              </Select>
            </FormControl>

            <TextField
              id="description"
              label="Mô tả chi tiết"
              variant="outlined"
              fullWidth
              multiline
              rows={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Mô tả chi tiết vấn đề. Bao gồm các bước tái hiện, thông báo lỗi, v.v."
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
              <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}>
                Hủy
              </Button>
              <Button type="submit" variant="contained" disabled={loading || loadingTypes}>
                {loading ? <CircularProgress size={24} /> : 'Gửi Ticket'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTicketPage; 