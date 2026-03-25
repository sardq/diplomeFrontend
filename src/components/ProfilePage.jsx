import React, { useState, useEffect, useContext } from 'react';
import { AuthContent } from './AuthContent';
import * as userActions from './service/userActions';
import * as groupActions from './service/groupActions';
import * as disciplineActions from './service/disciplineActions';
import { Button, Form, Card, Alert } from 'react-bootstrap';
import MyToast from './MyToast';

const ProfilePage = () => {
  const { role } = useContext(AuthContent);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);
  const [disciplines, setDisciplines] = useState([]);
  const [groupName, setGroupName] = useState('');

  const showToastMessage = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  const ROLE_LABELS = {
  ADMIN: 'Администратор',
  STUDENT: 'Студент',
  TEACHER: 'Преподаватель',
};
  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await userActions.getMe();
        setUser(me);
        setFormData({
          login: me.login,
          email: me.email,
          firstName: me.firstName || '',
          lastName: me.lastName || '',
          role: me.role,
        });

        if (me.role === 'STUDENT') {
          const groups = await groupActions.getAllGroups(0);
          const studentGroup = groups.find(g => g.studentIds?.includes(me.id));
          if (studentGroup) {
            setGroupName(studentGroup.name);
            const disc = await disciplineActions.GetDisciplinesByGroup(studentGroup.id);
            setDisciplines(disc);
          }
        }

        if (me.role === 'TEACHER') {
          const disc = await disciplineActions.getDisciplinesTeacher(me.id);
          setDisciplines(disc);
        }
      } catch (err) {
        showToastMessage('Ошибка загрузки профиля', 'danger');
      }
    };
    loadUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.login || formData.login.trim().length < 4) {
      showToastMessage('Логин должен быть минимум 4 символа', 'danger');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      showToastMessage('Введите корректный email', 'danger');
      return false;
    }
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      showToastMessage('Имя должно быть минимум 2 символа', 'danger');
      return false;
    }
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      showToastMessage('Фамилия должна быть минимум 2 символа', 'danger');
      return false;
    }
    if (!formData.role) {
      showToastMessage('Выберите роль', 'danger');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
  if (!user) return;
  if (!validateForm()) return;

  try {
    const updated = await userActions.updateAdmin(user.id, formData);
    console.log(updated);
    if (updated.token) {
      localStorage.setItem('token', updated.token);
    }

    setUser(prev => ({ ...prev, ...formData }));
    showToastMessage('Профиль обновлен', 'success');
  } catch (err) {
    showToastMessage('Ошибка сохранения', 'danger');
  }
};


  if (!user) return <p className="text-white">Загрузка...</p>;

  return (
    <div className="container mt-4" style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
      {showToast && (
        <MyToast 
          header={toastType === 'success' ? 'Успех' : 'Ошибка'} 
          show={showToast} 
          message={toastMessage} 
          type={toastType} 
        />
      )}

      <Card className="p-3 bg-dark text-white border-secondary" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3>Профиль</h3>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Логин</Form.Label>
            <Form.Control
              name="login"
              value={formData.login}
              onChange={handleChange}
              disabled={role !== 'ADMIN'}
              className="bg-secondary text-white border-dark"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={role !== 'ADMIN'}
              className="bg-secondary text-white border-dark"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Имя</Form.Label>
            <Form.Control
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={role !== 'ADMIN'}
              className="bg-secondary text-white border-dark"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Фамилия</Form.Label>
            <Form.Control
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={role !== 'ADMIN'}
              className="bg-secondary text-white border-dark"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Роль</Form.Label>
            <Form.Control
  value={ROLE_LABELS[formData.role] || formData.role}
  disabled
  className="bg-secondary text-white border-dark"
/>
          </Form.Group>

          {role === 'ADMIN' && (
            <Button variant="primary" onClick={handleSave}>Сохранить</Button>
          )}
        </Form>

        {role === 'STUDENT' && (
          <>
            <Alert variant="info" className="mt-3">
              Группа: {groupName || 'Не назначена'}
            </Alert>
            <h5>Дисциплины</h5>
            <ul>
              {disciplines.map(d => <li key={d.id}>{d.name}</li>)}
            </ul>
          </>
        )}

        {role === 'TEACHER' && (
          <>
            <h5 className="mt-3">Дисциплины, к которым прикреплен</h5>
            <ul>
              {disciplines.map(d => <li key={d.id}>{d.name}</li>)}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
