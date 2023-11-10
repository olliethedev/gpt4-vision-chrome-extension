import { useState, useEffect } from 'react';
import { runController } from './tool-controller';
import { CommandResult, ImageCommandResult, setChromeStorage, getChromeStorage } from './extension-helper';
import { ChatCompletionMessageParam } from 'openai/resources';

export const useAI = (initialTask: string) => {
  const [data, setData] = useState<(ChatCompletionMessageParam | CommandResult | ImageCommandResult)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const initialData = await getChromeStorage('chatData');
      let initialMessages;
      if (initialData) {
        setData(initialData);
        initialMessages = initialData.filter((item: any) => "role" in item);
      }
      await runController({initialTask, initialMessages, onMessageUpdate, onToolUpdate});
    };

    const onMessageUpdate = (data: ChatCompletionMessageParam) => {
      setData(
        (prevData) => {
          const newData = [...prevData, data];
          setChromeStorage('chatData', newData);
          return newData;
        }
      );
    };

    const onToolUpdate = (data: CommandResult| ImageCommandResult) => {
        setData(
            (prevData) => {
              const newData = [...prevData, data];
              setChromeStorage('chatData', newData);
              return newData;
            }
          );
    };

    fetchData();
  }, [initialTask]);

  return data;
};


