import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.Student.SocialApp",
  projectId: "669c8352001f2fdd3f60",
  storageId: "669c8717002a3cb11ec9",
  databaseId: "669c84e400087034b344",
  userCollectionId: "669c852400091e9d03f6",
  videoCollectionId: "669c856b000599cbd5af",
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);

    if (!newAccount) throw new Error("Account creation failed");

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(error.message || "An error occurred");
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailSession(email, password);
    return session;
  } catch (error) {
    console.error("Error signing in:", error);
    throw new Error(error.message || "An error occurred");
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    console.error("Error getting account:", error);
    throw new Error(error.message || "An error occurred");
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw new Error("No account found");

    const userDocuments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!userDocuments || !userDocuments.documents.length) throw new Error("No user found");

    return userDocuments.documents[0];
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error("Error signing out:", error);
    throw new Error(error.message || "An error occurred");
  }
}

// Upload File
export async function uploadFile(file, type) {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(error.message || "An error occurred");
  }
}

// Get File Preview
export async function getFilePreview(fileId, type) {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw new Error("File URL is not available");

    return fileUrl;
  } catch (error) {
    console.error("Error getting file preview:", error);
    throw new Error(error.message || "An error occurred");
  }
}

// Create Video Post
export async function createVideoPost(form) {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        description: form.description,  // Added description field
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    console.error("Error creating video post:", error);
    throw new Error(error.message || "An error occurred");
  }
}

// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId
    );

    return posts.documents.map(post => ({
      ...post,
      description: post.description || '' // Include description
    }));
  } catch (error) {
    console.error("Error getting all posts:", error);
    throw new Error(error.message || "An error occurred");
  }
}

// Get video posts created by user
export async function getUserPosts(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal("creator", userId)]
    );

    return posts.documents.map(post => ({
      ...post,
      description: post.description || '' // Include description
    }));
  } catch (error) {
    console.error("Error getting user posts:", error);
    throw new Error(error.message || "An error occurred");
  }
}

// Get video posts that match search query
export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("No posts found");

    return posts.documents.map(post => ({
      ...post,
      description: post.description || '' // Include description
    }));
  } catch (error) {
    console.error("Error searching posts:", error);
    throw new Error(error.message || "An error occurred");
  }
}

// Get latest created video posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return posts.documents.map(post => ({
      ...post,
      description: post.description || '' // Include description
    }));
  } catch (error) {
    console.error("Error getting latest posts:", error);
    throw new Error(error.message || "An error occurred");
  }
}
