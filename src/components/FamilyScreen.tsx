import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { Users, ArrowLeft, Edit2, Copy, Check, Trash2, Crown, Link, UserPlus, X, ChevronDown, LogOut, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User as UserType, Family, FamilyMember, JoinRequest } from '../types';
import { JoinRequestPopup } from './JoinRequestPopup';
import { JoinResponsePopup } from './JoinResponsePopup';
import { JoinRejectedPopup } from './JoinRejectedPopup';
import { FamilyDeletedPopup } from './FamilyDeletedPopup';
import { LeaveFamilyPopup } from './LeaveFamilyPopup';
import { RemovedFromFamilyPopup } from './RemovedFromFamilyPopup';

interface Props {
  onBack: () => void;
}

export function FamilyScreen({ onBack }: Props) {
  const [user, setUser] = useState<UserType | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [myJoinRequest, setMyJoinRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinRequestSent, setShowJoinRequestSent] = useState(false);
  
  // Состояния для попапов
  const [showJoinRequestPopup, setShowJoinRequestPopup] = useState(false);
  const [currentJoinRequest, setCurrentJoinRequest] = useState<JoinRequest | null>(null);
  const [showJoinResponsePopup, setShowJoinResponsePopup] = useState(false);
  const [joinResponseAccepted, setJoinResponseAccepted] = useState(false);
  const [showJoinRejectedPopup, setShowJoinRejectedPopup] = useState(false);
  const [rejectedFamilyName, setRejectedFamilyName] = useState('');
  const [showFamilyDeletedPopup, setShowFamilyDeletedPopup] = useState(false);
  const [deletedFamilyName, setDeletedFamilyName] = useState('');
  const [showLeaveFamilyPopup, setShowLeaveFamilyPopup] = useState(false);
  const [leftFamilyName, setLeftFamilyName] = useState('');
  const [showRemovedFromFamilyPopup, setShowRemovedFromFamilyPopup] = useState(false);
  const [removedFromFamilyName, setRemovedFromFamilyName] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaveError, setLeaveError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profileResponse = await api.getProfile();
      setUser(profileResponse.data.user);
      
      const familyResponse = await api.getFamily();
      if (familyResponse.data.family) {
        setFamily(familyResponse.data.family);
        setMembers(familyResponse.data.members);
        setPendingRequests(familyResponse.data.pendingRequests);
      } else {
        setFamily(null);
        setMembers([]);
        setPendingRequests([]);
      }
      
      // Загружаем текущий запрос на вступление пользователя
      try {
        const myRequestResponse = await api.getMyJoinRequest();
        setMyJoinRequest(myRequestResponse.data.request);
      } catch (error) {
        setMyJoinRequest(null);
      }
    } catch (error: any) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  // Polling для проверки новых заявок (для главы семьи)
  usePolling(
    async () => {
      try {
        const familyResponse = await api.getFamily();
        const newRequests = familyResponse.data.pendingRequests || [];

        // Проверяем, есть ли новые заявки
        if (newRequests.length > pendingRequests.length) {
          const latestRequest = newRequests[0];
          setCurrentJoinRequest(latestRequest);
          setShowJoinRequestPopup(true);
        }

        setPendingRequests(newRequests);
      } catch (error) {
        console.error('Ошибка проверки заявок:', error);
      }
    },
    3_000,
    !!family && family.owner_id === user?.id
  );

  // Polling для проверки статуса своей заявки (для обычного участника)
  usePolling(
    async () => {
      try {
        const myRequestResponse = await api.getMyJoinRequest();
        const request = myRequestResponse.data.request;

        if (!request) {
          // Заявка обработана - проверяем, принята ли она
          const profileResponse = await api.getProfile();
          if (profileResponse.data.family) {
            // Заявка принята
            setJoinResponseAccepted(true);
            setShowJoinResponsePopup(true);
            setFamily(profileResponse.data.family);
            setMyJoinRequest(null);
          } else {
            // Заявка отклонена - показываем попап отклонения
            setRejectedFamilyName(myJoinRequest?.family_name || 'Семья');
            setShowJoinRejectedPopup(true);
            setMyJoinRequest(null);
          }
        }
      } catch (error) {
        console.error('Ошибка проверки статуса заявки:', error);
      }
    },
    3_000,
    !!myJoinRequest && !family
  );

  // Polling для проверки существования семьи (для участников)
  usePolling(
    async () => {
      try {
        const familyResponse = await api.getFamily();
        if (!familyResponse.data.family) {
          // Семья удалена
          setDeletedFamilyName(family!.name);
          setShowFamilyDeletedPopup(true);
          setFamily(null);
          setMembers([]);
        } else {
          // Проверяем, остался ли пользователь в семье
          const currentMembers = familyResponse.data.members || [];
          const isStillMember = currentMembers.some((m: any) => m.id === user?.id);

          if (!isStillMember) {
            // Пользователь был удалён из семьи
            setRemovedFromFamilyName(family!.name);
            setShowRemovedFromFamilyPopup(true);
            setFamily(null);
            setMembers([]);
          }
        }
      } catch (error) {
        console.error('Ошибка проверки семьи:', error);
      }
    },
    3_000,
    !!family && family.owner_id !== user?.id
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-b-2 border-orange-500 rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-gray-600">Ошибка загрузки данных</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">Семья</h2>
      </div>

      {/* Отображение текущего запроса на вступление */}
      {myJoinRequest && !family && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Заявка на рассмотрении</h3>
              <p className="text-sm text-gray-600 mb-2">
                Вы отправили заявку на вступление в семью <strong>"{myJoinRequest.family_name}"</strong>
              </p>
              <p className="text-xs text-gray-500">
                Ожидайте ответа от главы семьи. Мы уведомим вас о решении.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-600 font-medium">Заявка активна</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Поп-ап после отправки запроса */}
      <AnimatePresence>
        {showJoinRequestSent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowJoinRequestSent(false)}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-4xl">📨</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Заявка отправлена!</h3>
                <p className="text-gray-600">
                  Ваша заявка на вступление в семью успешно отправлена
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-purple-700 text-center">
                  Глава семьи рассмотрит вашу заявку и примет решение. Мы уведомим вас о результате.
                </p>
              </div>

              <button
                onClick={() => setShowJoinRequestSent(false)}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Понятно
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основной контент */}
      {family ? (
        <FamilyView
          family={family}
          currentUser={user}
          members={members}
          pendingRequests={pendingRequests}
          onUpdate={loadData}
          onLeaveFamily={(familyName: string) => {
            setLeftFamilyName(familyName);
            setShowLeaveFamilyPopup(true);
            setFamily(null);
            setMembers([]);
          }}
        />
      ) : (
        <NoFamilyView
          onJoinRequestSent={() => {
            setShowJoinRequestSent(true);
            loadData();
          }}
        />
      )}

      {/* Попап заявки на вступление (для главы семьи) */}
      {showJoinRequestPopup && currentJoinRequest && (
        <JoinRequestPopup
          isOpen={showJoinRequestPopup}
          onClose={() => {
            setShowJoinRequestPopup(false);
            setCurrentJoinRequest(null);
          }}
          onAccept={async () => {
            try {
              await api.respondToJoinRequest(currentJoinRequest.id, true);
              setShowJoinRequestPopup(false);
              setCurrentJoinRequest(null);
              await loadData();
            } catch (error) {
              console.error('Ошибка принятия заявки:', error);
            }
          }}
          onReject={async () => {
            try {
              await api.respondToJoinRequest(currentJoinRequest.id, false);
              setShowJoinRequestPopup(false);
              setCurrentJoinRequest(null);
              await loadData();
            } catch (error) {
              console.error('Ошибка отклонения заявки:', error);
            }
          }}
          onLater={() => {
            setShowJoinRequestPopup(false);
            setCurrentJoinRequest(null);
          }}
          userName={currentJoinRequest.name}
          userEmail={currentJoinRequest.email}
          userAvatar={currentJoinRequest.avatar}
        />
      )}

      {/* Попап ответа на заявку (для пользователя) */}
      {showJoinResponsePopup && family && (
        <JoinResponsePopup
          isOpen={showJoinResponsePopup}
          onClose={() => setShowJoinResponsePopup(false)}
          onNavigate={() => {
            setShowJoinResponsePopup(false);
            // Перезагружаем данные для отображения семьи
            loadData();
          }}
          accepted={joinResponseAccepted}
          familyName={family.name}
        />
      )}

      {/* Попап удаления семьи (для участников) */}
      {showFamilyDeletedPopup && (
        <FamilyDeletedPopup
          isOpen={showFamilyDeletedPopup}
          onClose={() => {
            setShowFamilyDeletedPopup(false);
            setDeletedFamilyName('');
          }}
          familyName={deletedFamilyName}
        />
      )}

      {/* Попап выхода из семьи */}
      {showLeaveFamilyPopup && (
        <LeaveFamilyPopup
          isOpen={showLeaveFamilyPopup}
          onClose={() => {
            setShowLeaveFamilyPopup(false);
            setLeftFamilyName('');
          }}
          familyName={leftFamilyName}
        />
      )}

      {/* Попап удаления из семьи */}
      {showRemovedFromFamilyPopup && (
        <RemovedFromFamilyPopup
          isOpen={showRemovedFromFamilyPopup}
          onClose={() => {
            setShowRemovedFromFamilyPopup(false);
            setRemovedFromFamilyName('');
          }}
          familyName={removedFromFamilyName}
        />
      )}

      {/* Попап отклонения заявки */}
      {showJoinRejectedPopup && (
        <JoinRejectedPopup
          isOpen={showJoinRejectedPopup}
          onClose={() => {
            setShowJoinRejectedPopup(false);
            setRejectedFamilyName('');
          }}
          familyName={rejectedFamilyName}
        />
      )}
    </div>
  );
}

function FamilyView({
  family,
  currentUser,
  members,
  pendingRequests,
  onUpdate,
  onLeaveFamily,
}: {
  family: Family;
  currentUser: UserType;
  members: FamilyMember[];
  pendingRequests: JoinRequest[];
  onUpdate: () => void;
  onLeaveFamily: (familyName: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [openActionsMenu, setOpenActionsMenu] = useState<number | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editName, setEditName] = useState(family.name);
  const [editAvatar, setEditAvatar] = useState(family.avatar);
  const [editError, setEditError] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaveError, setLeaveError] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState<number | null>(null);

  const isOwner = family.owner_id === currentUser.id;

  const familyAvatars = ['👨‍👩‍👧‍👦', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👦', '👩‍👦', '👨‍👧', '👩‍👧', '🏠', '❤️'];

  const handleCopyLink = async () => {
    if (!family.invite_link) {
      console.error('Ссылка-приглашение отсутствует');
      return;
    }
    
    try {
      // Пробуем современный API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(family.invite_link);
      } else {
        // Fallback для старых браузеров или non-secure context
        const textArea = document.createElement('textarea');
        textArea.value = family.invite_link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback копирование не удалось:', err);
        }
        
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Ошибка копирования:', error);
      alert('Не удалось скопировать ссылку. Попробуйте выделить и скопировать вручную.');
    }
  };

  const handleDeleteFamily = async () => {
    setDeleteError('');
    try {
      await api.deleteFamily();
      window.location.reload();
    } catch (error: any) {
      setDeleteError(error.message || 'Ошибка удаления семьи');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await api.removeFamilyMember(memberId);
      setShowRemoveConfirm(null);
      setOpenActionsMenu(null);
      window.location.reload();
    } catch (error: any) {
      alert(error.message || 'Ошибка удаления участника');
    }
  };

  const handleAssignRole = async (userId: number, role: string) => {
    try {
      await api.assignFamilyRole(userId, role);
      onUpdate();
      setOpenActionsMenu(null);
    } catch (error: any) {
      alert(error.message || 'Ошибка назначения роли');
    }
  };

  const handleLeaveFamily = async () => {
    setLeaveError('');
    try {
      const familyName = family.name;
      await api.leaveFamily();
      setShowLeaveConfirm(false);
      onLeaveFamily(familyName);
    } catch (error: any) {
      setLeaveError(error.message || 'Ошибка выхода из семьи');
    }
  };

  const handleTransferOwnership = async (newOwnerId: number) => {
    try {
      await api.transferOwnership(newOwnerId);
      setOpenActionsMenu(null);
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Ошибка передачи роли');
    }
  };

  const handleRespondToRequest = async (requestId: number, accept: boolean) => {
    try {
      await api.respondToJoinRequest(requestId, accept);
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Ошибка обработки заявки');
    }
  };

  const handleUpdateFamily = async () => {
    if (!editName.trim()) {
      setEditError('Название семьи обязательно');
      return;
    }
    
    setEditError('');
    try {
      await api.updateFamily({
        name: editName.trim(),
        avatar: editAvatar,
      });
      setShowEditModal(false);
      onUpdate();
    } catch (error: any) {
      setEditError(error.message || 'Ошибка обновления семьи');
    }
  };

  return (
    <>
      {/* Family card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">{family.avatar}</div>
          <h3 className="text-lg font-bold text-gray-800">{family.name}</h3>
          {family.description && <p className="text-sm text-gray-500 mt-1">{family.description}</p>}
        </div>
        
        {isOwner && (
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full py-2.5 bg-orange-50 text-orange-600 font-medium rounded-xl hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Редактировать семью
          </button>
        )}
      </div>

      {/* Pending Requests (for owner) */}
      {isOwner && pendingRequests.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-200 space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-500" />
            Заявки на вступление ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-2xl">{request.avatar}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{request.name}</p>
                  <p className="text-xs text-gray-500">{request.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespondToRequest(request.id, true)}
                    className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Принять
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(request.id, false)}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Участники ({members.length})</h3>
        <div className="space-y-2">
          {members
            .sort((a, b) => {
              if (a.role === 'owner') return -1;
              if (b.role === 'owner') return 1;
              if (a.role === 'chef' && b.role !== 'chef') return -1;
              if (b.role === 'chef' && a.role !== 'chef') return 1;
              return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
            })
            .map((member) => {
              const isCurrentUser = member.id === currentUser.id;
              const canAssignRole = isOwner && member.id !== currentUser.id;
              
              return (
                <div 
                  key={member.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isCurrentUser 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <span className="text-2xl">{member.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{member.name}</p>
                      {isCurrentUser && (
                        <span className="text-xs text-orange-600 font-medium">(Вы)</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {member.role === 'owner' && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                          <Crown className="w-3 h-3" />
                          <span>Глава семьи</span>
                        </div>
                      )}
                      {member.role === 'chef' && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          <span>👨‍🍳</span>
                          <span>Поварушка</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {canAssignRole && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenActionsMenu(openActionsMenu === member.id ? null : member.id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        Действия
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {openActionsMenu === member.id && (
                        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              const newRole = member.role === 'chef' ? 'member' : 'chef';
                              handleAssignRole(member.id, newRole);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <span>{member.role === 'chef' ? '🚫' : '👨‍🍳'}</span>
                            <span>{member.role === 'chef' ? 'Убрать роль Поварушки' : 'Назначить Поварушкой'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowTransferConfirm(member.id);
                              setOpenActionsMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 transition-colors flex items-center gap-2"
                          >
                            <Crown className="w-4 h-4" />
                            <span>Сделать главным</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowRemoveConfirm(member.id);
                              setOpenActionsMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Удалить из семьи</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Invite link */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <label className="text-sm font-medium text-gray-700">Ссылка для приглашения</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={family.invite_link}
            readOnly
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'OK' : 'Копировать'}
          </button>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="w-full py-3 bg-purple-50 text-purple-600 font-medium rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
        >
          📤 Поделиться в соцсетях
        </button>
      </div>

      {/* Delete Family Section (for owner) */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-red-200 p-5 space-y-4">
          {/* Напоминалка для главы */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Внимание:</strong> Как глава семьи, вы не можете покинуть семью. Сначала удалите профиль семьи или передайте роль главы другому участнику.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Удалить профиль семьи
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800 font-medium mb-1">Вы уверены?</p>
                <p className="text-xs text-red-600">Профиль семьи будет удалён для всех участников.</p>
              </div>
              
              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{deleteError}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteError('');
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteFamily}
                  className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leave Family Section (for non-owners) */}
      {!isOwner && (
        <div className="bg-white rounded-2xl border border-orange-200 p-5 space-y-4">
          {!showLeaveConfirm ? (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="w-full py-3 bg-orange-50 text-orange-600 font-medium rounded-xl hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Выйти из семьи
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-sm text-orange-800 font-medium mb-1">Вы уверены?</p>
                <p className="text-xs text-orange-600">Вы покинете семью "{family.name}" и потеряете доступ к общему меню.</p>
              </div>
              
              {leaveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{leaveError}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowLeaveConfirm(false);
                    setLeaveError('');
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleLeaveFamily}
                  className="flex-1 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Выйти
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Family Modal */}
      {showEditModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Редактировать семью</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Аватар семьи</label>
                <div className="flex gap-2 flex-wrap">
                  {familyAvatars.map((a) => (
                    <button
                      key={a}
                      onClick={() => setEditAvatar(a)}
                      className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                        editAvatar === a ? 'bg-orange-100 ring-2 ring-orange-400' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Название семьи</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Например: Семья Ивановых"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  maxLength={100}
                />
              </div>

              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{editError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleUpdateFamily}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Remove Member Confirmation Modal */}
      {showRemoveConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowRemoveConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Удалить участника</h3>
              <button
                onClick={() => setShowRemoveConfirm(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Вы уверены, что хотите удалить этого участника из семьи "{family.name}"?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRemoveConfirm(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleRemoveMember(showRemoveConfirm)}
                className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Transfer Ownership Confirmation Modal */}
      {showTransferConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowTransferConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Передать роль главы</h3>
              <button
                onClick={() => setShowTransferConfirm(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Внимание:</strong> Вы передаёте роль главы семьи другому участнику. После этого вы станете обычным участником и не сможете управлять семьёй.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Вы уверены, что хотите передать роль главы семьи участнику <strong>{members.find(m => m.id === showTransferConfirm)?.name}</strong>?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowTransferConfirm(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  handleTransferOwnership(showTransferConfirm);
                  setShowTransferConfirm(null);
                }}
                className="flex-1 py-3 bg-yellow-500 text-white font-medium rounded-xl hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Передать
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowShareModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Поделиться в соцсетях</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Пригласите друзей и семью присоединиться к "{family.name}" в MealPick!
            </p>

            <div className="grid grid-cols-3 gap-3">
              {/* Telegram */}
              <button
                onClick={() => {
                  const url = encodeURIComponent(family.invite_link);
                  const text = encodeURIComponent(`Присоединяйся к семье "${family.name}" в MealPick!`);
                  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
                  ✈️
                </div>
                <span className="text-xs font-medium text-gray-700">Telegram</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => {
                  const url = encodeURIComponent(family.invite_link);
                  const text = encodeURIComponent(`Присоединяйся к семье "${family.name}" в MealPick!`);
                  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
                  💬
                </div>
                <span className="text-xs font-medium text-gray-700">WhatsApp</span>
              </button>

              {/* Viber */}
              <button
                onClick={() => {
                  const url = encodeURIComponent(family.invite_link);
                  const text = encodeURIComponent(`Присоединяйся к семье "${family.name}" в MealPick!`);
                  window.open(`viber://forward?text=${text}%20${url}`, '_blank');
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl">
                  📱
                </div>
                <span className="text-xs font-medium text-gray-700">Viber</span>
              </button>

              {/* VK */}
              <button
                onClick={() => {
                  const url = encodeURIComponent(family.invite_link);
                  const title = encodeURIComponent(`Присоединяйся к семье "${family.name}" в MealPick!`);
                  window.open(`https://vk.com/share.php?url=${url}&title=${title}`, '_blank');
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  VK
                </div>
                <span className="text-xs font-medium text-gray-700">ВКонтакте</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => {
                  const url = encodeURIComponent(family.invite_link);
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  f
                </div>
                <span className="text-xs font-medium text-gray-700">Facebook</span>
              </button>

              {/* Twitter */}
              <button
                onClick={() => {
                  const url = encodeURIComponent(family.invite_link);
                  const text = encodeURIComponent(`Присоединяйся к семье "${family.name}" в MealPick!`);
                  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white text-2xl">
                  🐦
                </div>
                <span className="text-xs font-medium text-gray-700">Twitter</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

function NoFamilyView({ onJoinRequestSent }: { onJoinRequestSent: () => void }) {
  const [joinLink, setJoinLink] = useState('');
  const [joinError, setJoinError] = useState('');
  const [createName, setCreateName] = useState('');
  const [createAvatar, setCreateAvatar] = useState('👨‍👩‍👧‍👦');
  const [createDescription, setCreateDescription] = useState('');

  const familyAvatars = ['👨‍👩‍👧‍👦', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👦', '👩‍👦', '👨‍👧', '👩‍👧', '🏠', '❤️'];

  const handleRequestJoin = async () => {
    if (!joinLink.trim()) return;
    setJoinError('');
    try {
      await api.joinFamily(joinLink.trim());
      setJoinLink('');
      onJoinRequestSent();
    } catch (error: any) {
      setJoinError(error.message || 'Ошибка отправки заявки');
    }
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    try {
      await api.createFamily({ name: createName, avatar: createAvatar, description: createDescription });
      onJoinRequestSent();
    } catch (error: any) {
      alert(error.message || 'Ошибка создания семьи');
    }
  };

  return (
    <>
      {/* Join Family */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Link className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Присоединиться к семье</h3>
            <p className="text-xs text-gray-500">Вставьте ссылку-приглашение</p>
          </div>
        </div>
        
        <input
          type="text"
          value={joinLink}
          onChange={(e) => setJoinLink(e.target.value)}
          placeholder="https://mealspick.app/join/..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
        />
        
        {joinError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{joinError}</p>
          </div>
        )}
        
        <button
          onClick={handleRequestJoin}
          disabled={!joinLink.trim()}
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Отправить заявку
        </button>
      </div>

      {/* Create Family */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Создать новую семью</h3>
            <p className="text-xs text-gray-500">Станьте главой семьи</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Аватар семьи</label>
          <div className="flex gap-2 flex-wrap">
            {familyAvatars.map((a) => (
              <button
                key={a}
                onClick={() => setCreateAvatar(a)}
                className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                  createAvatar === a ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Название семьи</label>
          <input
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Например: Семья Ивановых"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Описание (необязательно)</label>
          <textarea
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
            placeholder="О вашей семье..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!createName.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Создать профиль семьи
        </button>
      </div>
    </>
  );
}
