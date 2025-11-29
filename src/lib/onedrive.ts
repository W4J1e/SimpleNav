import { Client } from '@microsoft/microsoft-graph-client';

// 自定义认证提供程序
interface AuthenticationProvider {
  getAccessToken(): Promise<string>;
}

class CustomAuthProvider implements AuthenticationProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken;
  }
}

// 获取OneDrive客户端
export function getOneDriveClient(accessToken: string): Client {
  const authProvider = new CustomAuthProvider(accessToken);
  return Client.initWithMiddleware({ authProvider });
}

// OneDrive文件操作
export class OneDriveService {
  private client: Client;
  private appFolder: string;

  constructor(accessToken: string, appFolder: string = 'MyNavApp') {
    this.client = getOneDriveClient(accessToken);
    this.appFolder = appFolder;
  }

  // 确保应用文件夹存在
  async ensureAppFolder(): Promise<string> {
    try {
      // 尝试获取应用文件夹
      const folder = await this.client
        .api(`/me/drive/special/approot`)
        .get();
      
      return folder.id;
    } catch (error) {
      console.error('确保应用文件夹失败:', error);
      throw error;
    }
  }

  // 读取文件内容
  async readFile(fileName: string): Promise<string | null> {
    try {
      await this.ensureAppFolder();
      
      const response = await this.client
        .api(`/me/drive/special/approot:/${fileName}`)
        .get();
      
      if (response && response['@microsoft.graph.downloadUrl']) {
        const downloadResponse = await fetch(response['@microsoft.graph.downloadUrl']);
        if (downloadResponse.ok) {
          return await downloadResponse.text();
        }
      }
      
      return null;
    } catch (error: any) {
      // 文件不存在时返回 null
      if (error.statusCode === 404) {
        return null;
      }
      console.error(`读取文件 ${fileName} 失败:`, error);
      return null;
    }
  }

  // 写入文件内容
  async writeFile(fileName: string, content: string): Promise<boolean> {
    try {
      await this.ensureAppFolder();
      
      await this.client
        .api(`/me/drive/special/approot:/${fileName}:/content`)
        .put(content);
      
      return true;
    } catch (error) {
      console.error(`写入文件 ${fileName} 失败:`, error);
      return false;
    }
  }

  // 检查文件是否存在
  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.client
        .api(`/me/drive/special/approot:/${fileName}`)
        .get();
      
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      console.error(`检查文件 ${fileName} 失败:`, error);
      return false;
    }
  }

  // 删除文件
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      await this.client
        .api(`/me/drive/special/approot:/${fileName}`)
        .delete();
      
      return true;
    } catch (error) {
      console.error(`删除文件 ${fileName} 失败:`, error);
      return false;
    }
  }

  // 列出所有文件
  async listFiles(): Promise<string[]> {
    try {
      await this.ensureAppFolder();
      
      const response = await this.client
        .api(`/me/drive/special/approot:/children`)
        .get();
      
      return response.value.map((file: any) => file.name);
    } catch (error) {
      console.error('列出文件失败:', error);
      return [];
    }
  }
}