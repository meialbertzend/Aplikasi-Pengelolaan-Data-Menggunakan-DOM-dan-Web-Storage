document.addEventListener("DOMContentLoaded", function () {
    const inputBookTitle = document.getElementById("inputBookTitle");
    const inputBookAuthor = document.getElementById("inputBookAuthor");
    const inputBookYear = document.getElementById("inputBookYear");
    const inputBookIsComplete = document.getElementById("inputBookIsComplete");
    const bookSubmitButton = document.getElementById("bookSubmit");
    const searchBookForm = document.getElementById("searchBook");
    const searchBookTitle = document.getElementById("searchBookTitle");
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");

    // Fungsi untuk menghasilkan ID unik
    function generateUniqueId() {
        return +new Date();
    }

    // Fungsi untuk membuat objek buku
    function createBook(id, title, author, year, isComplete) {
        return {
            id,
            title,
            author,
            year,
            isComplete,
        };
    }

    // Fungsi untuk menambahkan buku ke rak
    function addBookToShelf(book, isComplete) {
        const bookItem = document.createElement("article");
        bookItem.classList.add("book_item");
        bookItem.id = book.id;

        // Periksa apakah buku selesai atau belum
        const buttonText = isComplete ? "Belum selesai dibaca" : "Selesai dibaca";

        bookItem.innerHTML = `
        <h3>${book.title}</h3>
        <p>Penulis: ${book.author}</p>
        <p>Tahun: ${book.year}</p>
        <div class="action">
          <button class="green">${buttonText}</button>
          <button class="red">Hapus buku</button>
        </div>
      `;

        // Tambahkan event listener untuk tombol-tombol
        bookItem.querySelector(".green").addEventListener("click", function () {
            moveBookToShelf(book, !book.isComplete);
        });

        bookItem.querySelector(".red").addEventListener("click", function () {
            removeBook(book);
        });

        if (isComplete) {
            completeBookshelfList.appendChild(bookItem);
        } else {
            incompleteBookshelfList.appendChild(bookItem);
        }
    }

    // Fungsi untuk memindahkan buku antara rak
    function moveBookToShelf(book, isComplete) {
        const shelfToMove = isComplete ? completeBookshelfList : incompleteBookshelfList;
        const shelfToRemoveFrom = isComplete ? incompleteBookshelfList : completeBookshelfList;

        if (shelfToRemoveFrom.contains(document.getElementById(book.id))) {
            shelfToRemoveFrom.removeChild(document.getElementById(book.id));
        }

        addBookToShelf(book, isComplete);

        book.isComplete = isComplete;
        updateLocalStorage();
    }

    // Fungsi untuk menghapus buku dari rak
    function removeBook(book) {
        const shelf = book.isComplete ? completeBookshelfList : incompleteBookshelfList;

        // Tampilkan dialog konfirmasi
        const confirmation = window.confirm("Apakah Anda yakin ingin menghapus buku ini?");

        // Hapus buku hanya jika pengguna menekan "OK"
        if (confirmation) {
            shelf.removeChild(document.getElementById(book.id));
            removeFromLocalStorage(book.id);
        }
    }

    // Fungsi untuk menyimpan buku ke dalam local storage
    function updateLocalStorage() {
        const books = [...incompleteBookshelfList.children, ...completeBookshelfList.children].map((bookItem) => {
            const id = bookItem.id;
            const title = bookItem.querySelector("h3").textContent;
            const author = bookItem.querySelector("p:nth-child(2)").textContent.replace("Penulis: ", "");
            const year = parseInt(bookItem.querySelector("p:nth-child(3)").textContent.replace("Tahun: ", ""));
            const isComplete = bookItem.parentElement === completeBookshelfList;

            return createBook(id, title, author, year, isComplete);
        });

        localStorage.setItem("books", JSON.stringify(books));
    }

    // Fungsi untuk menghapus buku dari local storage
    function removeFromLocalStorage(bookId) {
        let books = JSON.parse(localStorage.getItem("books")) || [];
        books = books.filter((book) => book.id !== bookId);
        localStorage.setItem("books", JSON.stringify(books));
    }

    // Fungsi untuk memuat buku-buku dari local storage saat halaman dimuat
    function loadBooks() {
        const books = JSON.parse(localStorage.getItem("books")) || [];
        for (const book of books) {
            const shelf = book.isComplete ? completeBookshelfList : incompleteBookshelfList;
            addBookToShelf(book, book.isComplete);
        }
    }

    // Fungsi untuk menyaring buku berdasarkan judul
    function filterBooksByTitle(title) {
        const allBooks = [
            ...incompleteBookshelfList.children,
            ...completeBookshelfList.children
        ];

        for (const bookItem of allBooks) {
            const bookTitle = bookItem.querySelector("h3").textContent.toLowerCase();
            if (bookTitle.includes(title.toLowerCase())) {
                bookItem.style.display = "block";
            } else {
                bookItem.style.display = "none";
            }
        }
    }

    // Event listener untuk mengirimkan form pencarian
    searchBookForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const searchTerm = searchBookTitle.value;
        filterBooksByTitle(searchTerm);
    });

    // Event listener untuk menambahkan buku baru
    bookSubmitButton.addEventListener("click", function () {
        const id = generateUniqueId();
        const title = inputBookTitle.value;
        const author = inputBookAuthor.value;
        const year = parseInt(inputBookYear.value);
        const isComplete = inputBookIsComplete.checked;

        const book = createBook(id, title, author, year, isComplete);

        addBookToShelf(book, isComplete);
        updateLocalStorage();

        // Mengosongkan input setelah buku ditambahkan
        inputBookTitle.value = "";
        inputBookAuthor.value = "";
        inputBookYear.value = "";
        inputBookIsComplete.checked = false;
    });

    // Memuat buku-buku saat halaman dimuat
    loadBooks();
});
