import {
    initializeApp
  } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
  import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
  import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
  } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
  
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA48ChrwRXnTE4u-Z330d7WnYc0sjyJyMQ",
    authDomain: "socal-198cf.firebaseapp.com",
    projectId: "socal-198cf",
    storageBucket: "socal-198cf.firebasestorage.app",
    messagingSenderId: "152015958825",
    appId: "1:152015958825:web:77cabcd4768d1db2243d38"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const db = getFirestore();
  
  // DOM Elements
  const authButton = document.getElementById("authButton");
  const registerButton = document.getElementById("registerButton"); // Target Register Button
  const mainContent = document.getElementById("mainContent");
  const postBlogButton = document.getElementById("postBlog");
  const blogsContainer = document.getElementById("blogsContainer");
  const searchBar = document.getElementById("searchBar");
  
  let currentUser = null;
  
  // Auth state listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      authButton.textContent = "Logout";
      loadBlogs();
    } else {
      currentUser = null;
      authButton.textContent = "Login";
      loadBlogs();
    }
  });
  
  // Register User
  registerButton.addEventListener("click", async () => {
    const email = prompt("Enter your email to register:");
    const password = prompt("Enter your password:");
    if (!email || !password) {
      alert("Please fill in both email and password.");
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert(`Account created successfully! Welcome, ${userCredential.user.email}`);
    } catch (error) {
      alert(`Failed to register: ${error.message}`);
    }
  });
  
  // Post Blog
  postBlogButton.addEventListener("click", async () => {
    const title = document.getElementById("blogTitle").value;
    const content = document.getElementById("blogContent").value;
    const category = document.getElementById("blogCategory").value;
  
    if (!title || !content || !currentUser) {
      alert("Please fill in all fields and login first.");
      return;
    }
  
    const blogData = {
      title,
      content,
      category,
      author: currentUser.email,
      timestamp: new Date(),
    };
  
    await addDoc(collection(db, "blogs"), blogData);
    alert("Blog posted successfully!");
    loadBlogs();
  });
  
  // Load Blogs
  async function loadBlogs() {
    const blogsQuery = query(collection(db, "blogs"), orderBy("timestamp", "desc"));
    const blogsSnapshot = await getDocs(blogsQuery);
    blogsContainer.innerHTML = "<h2>All Blogs</h2>";
  
    blogsSnapshot.forEach((doc) => {
      const blog = doc.data();
      const blogElement = document.createElement("div");
      blogElement.classList.add("blog-post");
  
      blogElement.innerHTML = `
        <h3>${blog.title}</h3>
        <small>By: ${blog.author} | ${new Date(blog.timestamp.seconds * 1000).toLocaleString()}</small>
        <p>${blog.content}</p>
        <small>Category: ${blog.category}</small>
      `;
  
      if (currentUser && currentUser.email === blog.author) {
        blogElement.innerHTML += `
          <button onclick="editBlog('${doc.id}', '${blog.title}', '${blog.content}')">Edit</button>
          <button onclick="deleteBlog('${doc.id}')">Delete</button>
        `;
      }
  
      blogsContainer.appendChild(blogElement);
    });
  }
  
  // Edit Blog
  window.editBlog = async (id, title, content) => {
    const newTitle = prompt("Edit Title:", title);
    const newContent = prompt("Edit Content:", content);
  
    if (newTitle && newContent) {
      const blogRef = doc(db, "blogs", id);
      await updateDoc(blogRef, { title: newTitle, content: newContent });
      alert("Blog updated successfully!");
      loadBlogs();
    }
  };
  
  // Delete Blog
  window.deleteBlog = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this blog?");
    if (confirmDelete) {
      await deleteDoc(doc(db, "blogs", id));
      alert("Blog deleted successfully!");
      loadBlogs();
    }
  };
  
  // Search Blogs
  searchBar.addEventListener("input", async () => {
    const searchTerm = searchBar.value.toLowerCase();
    const blogsQuery = query(collection(db, "blogs"), orderBy("timestamp", "desc"));
    const blogsSnapshot = await getDocs(blogsQuery);
    blogsContainer.innerHTML = "<h2>Search Results</h2>";
  
    blogsSnapshot.forEach((doc) => {
      const blog = doc.data();
      if (blog.title.toLowerCase().includes(searchTerm) || blog.content.toLowerCase().includes(searchTerm)) {
        const blogElement = document.createElement("div");
        blogElement.classList.add("blog-post");
  
        blogElement.innerHTML = `
          <h3>${blog.title}</h3>
          <small>By: ${blog.author} | ${new Date(blog.timestamp.seconds * 1000).toLocaleString()}</small>
          <p>${blog.content}</p>
          <small>Category: ${blog.category}</small>
        `;
        blogsContainer.appendChild(blogElement);
      }
    });
  });
  
  // Auth Button (Login/Logout)
  authButton.addEventListener("click", () => {
    if (currentUser) {
      signOut(auth);
    } else {
      const email = prompt("Enter email:");
      const password = prompt("Enter password:");
      signInWithEmailAndPassword(auth, email, password)
        .catch((error) => alert("Failed to login: " + error.message));
    }
  });
  