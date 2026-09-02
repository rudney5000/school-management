import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi, chatActions, type Conversation } from '@entities/chat';
import { useAppDispatch } from '@shared/store/hooks';
import type { CreateConversationInput } from '@entities/chat/model/createConversationSchema';

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (payload: { memberIds: string[]; subSchoolId: string }) => {
      const input: CreateConversationInput = {
        type: 'dm',
        memberIds: payload.memberIds,
        subSchoolId: payload.subSchoolId,
      };
      const res = await chatApi.createConversation(input);
      if (!res.IsSuccess) throw new Error('Erreur création conversation');
      return res.result as Conversation;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      dispatch(chatActions.setActiveConversation(conversation.id));
    },
  });
}
