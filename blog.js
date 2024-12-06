import {
    auth,
    db,
    signOut,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
  } from "./firebase.js";
  
  // DOM Elements
  const authButton = document.getElementById("authButton");
  const postBlogButton = document.getElementById("postBlog");
  const blogsContainer = document.getElementById("blogsContainer");
  const searchBar = document.getElementById("searchBar");
  
  let currentUser = null;
  
  // Auth State Listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      authButton.textContent = "Logout";
      loadBlogs(); // Load blogs after login
    } else {
      currentUser = null;
      authButton.textContent = "Login";
      loadBlogs(); // Clear blogs if logged out
    }
  });
  
  // Post Blog
  postBlogButton.addEventListener("click", async () => {
    const title = document.getElementById("blogTitle").value.trim();
    const content = document.getElementById("blogContent").value.trim();
    const category = document.getElementById("blogCategory").value;
  
    if (!title || !content || !currentUser) {
      alert("Please fill in all fields and login first.");
      return;
    }
  
    try {
      const blogData = {
        title,
        content,
        category,
        author: currentUser.email,
        timestamp: new Date(),
      };
  
      await addDoc(collection(db, "blogs"), blogData);
      alert("Blog posted successfully!");
      loadBlogs(); // Reload blogs after posting
    } catch (error) {
      console.error("Error posting blog:", error);
      alert("Failed to post the blog. Please try again.");
    }
  });
  
  // Load Blogs
  async function loadBlogs() {
    try {
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
    } catch (error) {
      console.error("Error loading blogs:", error);
    }
  }
  
  // Edit Blog
  window.editBlog = async (id, title, content) => {
    const newTitle = prompt("Edit Title:", title);
    const newContent = prompt("Edit Content:", content);
  
    if (newTitle && newContent) {
      try {
        const blogRef = doc(db, "blogs", id);
        await updateDoc(blogRef, { title: newTitle, content: newContent });
        alert("Blog updated successfully!");
        loadBlogs(); // Reload blogs after editing
      } catch (error) {
        console.error("Error editing blog:", error);
      }
    }
  };
  
  // Delete Blog
  window.deleteBlog = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this blog?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "blogs", id));
        alert("Blog deleted successfully!");
        loadBlogs(); // Reload blogs after deletion
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };
  
  // Search Blogs
  searchBar.addEventListener("input", async () => {
    const searchTerm = searchBar.value.toLowerCase();
    try {
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
    } catch (error) {
      console.error("Error searching blogs:", error);
    }
  });
  
  // Auth Button (Login/Logout)
  authButton.addEventListener("click", () => {
    if (currentUser) {
      signOut(auth);
    } else {
      const email = prompt("Enter email:");
      const password = prompt("Enter password:");
      signInWithEmailAndPassword(auth, email, password).catch((error) =>
        alert("Failed to login: " + error.message)
      );
    }
  });
  