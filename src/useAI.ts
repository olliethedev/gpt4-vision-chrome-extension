import { useState, useEffect } from 'react';
import { ToolResult, runController } from './tool-controller';
import { setChromeStorage, getChromeStorage } from './extension-helper';
import { ChatCompletionMessageParam } from 'openai/resources';

export const useAI = (initialTask: string) => {
  const [data, setData] = useState<(ChatCompletionMessageParam | ToolResult)[]>([]);

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

    const onToolUpdate = (data: ToolResult) => {
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


