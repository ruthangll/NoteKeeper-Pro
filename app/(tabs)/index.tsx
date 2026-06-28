import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

type Note = {
  id: string;
  text: string;
  category: string;
  done: boolean;
  createdAt: string;
};

const NOTES_KEY = 'NOTEKEEPER_PRO_NOTES';
const THEME_KEY = 'NOTEKEEPER_PRO_DARK_MODE';
const STATS_KEY = 'NOTEKEEPER_PRO_STATS';
const CACHE_KEY = 'NOTEKEEPER_PRO_API_CACHE';
const PIN_KEY = 'NOTEKEEPER_PRO_PIN';

const categories = ['Kuliah', 'Tugas', 'Pribadi', 'Belanja', 'Ide'];
const sorts = ['Terbaru', 'A-Z', 'Selesai'];

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('Kuliah');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState('Terbaru');
  const [darkMode, setDarkMode] = useState(false);

  const [totalCreated, setTotalCreated] = useState(0);
  const [apiQuote, setApiQuote] = useState('Belum ada cache API.');
  const [pinStatus, setPinStatus] = useState('PIN belum disimpan');

  const [editModal, setEditModal] = useState(false);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('Kuliah');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const theme = darkMode ? darkStyles : lightStyles;

  async function loadAllData() {
    try {
      const savedNotes = await AsyncStorage.getItem(NOTES_KEY);
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      const savedStats = await AsyncStorage.getItem(STATS_KEY);
      const savedCache = await AsyncStorage.getItem(CACHE_KEY);
      const savedPin = await SecureStore.getItemAsync(PIN_KEY);

      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedTheme) setDarkMode(JSON.parse(savedTheme));
      if (savedStats) setTotalCreated(Number(savedStats));
      if (savedCache) setApiQuote(savedCache);
      if (savedPin) setPinStatus('PIN sudah tersimpan di SecureStore');
    } catch (error) {
      console.log('Gagal memuat data:', error);
    }
  }

  async function saveNotes(nextNotes: Note[]) {
    setNotes(nextNotes);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(nextNotes));
  }

  async function saveStats(nextTotal: number) {
    setTotalCreated(nextTotal);
    await AsyncStorage.setItem(STATS_KEY, nextTotal.toString());
  }

  async function toggleTheme() {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    await AsyncStorage.setItem(THEME_KEY, JSON.stringify(nextTheme));
  }

  function addNote() {
    if (input.trim() === '') {
      Alert.alert('Input kosong', 'Catatan tidak boleh kosong.');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      text: input.trim(),
      category,
      done: false,
      createdAt: new Date().toISOString(),
    };

    const nextNotes = [newNote, ...notes];

    saveNotes(nextNotes);
    saveStats(totalCreated + 1);
    setInput('');
  }

  function toggleDone(id: string) {
    const nextNotes = notes.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );

    saveNotes(nextNotes);
  }

  function confirmDelete(id: string) {
    Alert.alert('Hapus catatan?', 'Catatan yang dihapus tidak bisa dikembalikan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          const nextNotes = notes.filter((item) => item.id !== id);
          saveNotes(nextNotes);
        },
      },
    ]);
  }

  function confirmDeleteAll() {
    Alert.alert('Hapus semua?', 'Semua catatan akan dihapus dari AsyncStorage.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus Semua',
        style: 'destructive',
        onPress: async () => {
          setNotes([]);
          await AsyncStorage.removeItem(NOTES_KEY);
        },
      },
    ]);
  }

  function openEdit(note: Note) {
    setSelectedNote(note);
    setEditText(note.text);
    setEditCategory(note.category);
    setEditModal(true);
  }

  function saveEdit() {
    if (!selectedNote) return;

    if (editText.trim() === '') {
      Alert.alert('Input kosong', 'Catatan tidak boleh kosong.');
      return;
    }

    const nextNotes = notes.map((item) =>
      item.id === selectedNote.id
        ? { ...item, text: editText.trim(), category: editCategory }
        : item
    );

    saveNotes(nextNotes);
    setEditModal(false);
    setSelectedNote(null);
  }

  async function savePin() {
    await SecureStore.setItemAsync(PIN_KEY, '1234');
    setPinStatus('PIN 1234 tersimpan aman di SecureStore');
    Alert.alert('Berhasil', 'PIN sederhana berhasil disimpan di SecureStore.');
  }

  async function fetchAndCacheQuote() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      const data = await response.json();

      const text = `Cache API: ${data.title}`;
      setApiQuote(text);
      await AsyncStorage.setItem(CACHE_KEY, text);

      Alert.alert('Berhasil', 'Data API berhasil diambil dan disimpan ke cache.');
    } catch (error) {
      Alert.alert('Offline Mode', 'Gagal fetch API. Data cache tetap bisa ditampilkan.');
    }
  }

  const doneCount = notes.filter((item) => item.done).length;

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (filterCategory !== 'Semua') {
      result = result.filter((item) => item.category === filterCategory);
    }

    if (search.trim() !== '') {
      result = result.filter((item) =>
        item.text.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortMode === 'Selesai') {
      result = result.filter((item) => item.done);
    }

    if (sortMode === 'A-Z') {
      result.sort((a, b) => a.text.localeCompare(b.text));
    }

    if (sortMode === 'Terbaru') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [notes, search, filterCategory, sortMode]);

  function formatDate(date: string) {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <View style={[styles.container, theme.container]}>
      <Text style={[styles.title, theme.title]}>NoteKeeper Pro</Text>
      <Text style={[styles.subtitle, theme.subtitle]}>
        CRUD lokal dengan AsyncStorage
      </Text>

      <View style={[styles.statsBox, theme.card]}>
        <Text style={[styles.statsText, theme.text]}>Total dibuat: {totalCreated}</Text>
        <Text style={[styles.statsText, theme.text]}>Total catatan: {notes.length}</Text>
        <Text style={[styles.statsText, theme.text]}>Selesai: {doneCount}</Text>
      </View>

      <TouchableOpacity style={styles.darkButton} onPress={toggleTheme}>
        <Text style={styles.darkButtonText}>
          {darkMode ? 'Mode Terang' : 'Mode Gelap'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, theme.input]}
        placeholder="Tulis catatan baru..."
        placeholderTextColor={darkMode ? '#aaa' : '#999'}
        value={input}
        onChangeText={setInput}
      />

      <View style={styles.chipScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipScrollContent}
        >
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, theme.chip, category === item && styles.activeChip]}
              onPress={() => setCategory(item)}
            >
              <Text style={[styles.chipText, theme.chipText, category === item && styles.activeChipText]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addNote}>
        <Text style={styles.addButtonText}>Tambah Catatan</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.searchInput, theme.input]}
        placeholder="Cari catatan..."
        placeholderTextColor={darkMode ? '#aaa' : '#999'}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.smallChipScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.smallChipScroll}
          contentContainerStyle={styles.chipScrollContent}
        >
          {['Semua', ...categories].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.smallChip, theme.chip, filterCategory === item && styles.activeChip]}
              onPress={() => setFilterCategory(item)}
            >
              <Text
                style={[
                  styles.smallChipText,
                  theme.chipText,
                  filterCategory === item && styles.activeChipText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sortScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortScroll}
          contentContainerStyle={styles.chipScrollContent}
        >
          {sorts.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.sortButton, theme.sortButton, sortMode === item && styles.sortActive]}
              onPress={() => setSortMode(item)}
            >
              <Text style={[styles.sortText, theme.sortText, sortMode === item && styles.sortActiveText]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.apiButton} onPress={fetchAndCacheQuote}>
          <Text style={styles.actionText}>Cache API</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pinButton} onPress={savePin}>
          <Text style={styles.actionText}>Simpan PIN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteAllButton} onPress={confirmDeleteAll}>
          <Text style={styles.actionText}>Hapus Semua</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.cacheText, theme.subtitle]}>{apiQuote}</Text>
      <Text style={[styles.cacheText, theme.subtitle]}>{pinStatus}</Text>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={[styles.emptyBox, theme.card]}>
            <Text style={[styles.emptyTitle, theme.title]}>
              Belum ada catatan
            </Text>
            <Text style={[styles.emptyText, theme.subtitle]}>
              Tambahkan catatan pertama atau ubah filter pencarian.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.noteCard, theme.card]}>
            <TouchableOpacity
              style={styles.noteContent}
              onPress={() => toggleDone(item.id)}
            >
              <Text
                style={[
                  styles.noteText,
                  theme.text,
                  item.done && styles.doneText,
                ]}
              >
                {item.done ? '[Selesai] ' : '[Aktif] '}
                {item.text}
              </Text>

              <Text style={styles.noteMeta}>
                {item.category} • {formatDate(item.createdAt)}
              </Text>
            </TouchableOpacity>

            <View style={styles.noteActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)}>
                <Text style={styles.noteActionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(item.id)}
              >
                <Text style={styles.noteActionText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, theme.card]}>
            <Text style={[styles.modalTitle, theme.title]}>Edit Catatan</Text>

            <TextInput
              style={[styles.input, theme.input]}
              value={editText}
              onChangeText={setEditText}
              placeholder="Edit catatan..."
              placeholderTextColor={darkMode ? '#aaa' : '#999'}
            />

            <View style={styles.chipScrollContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                contentContainerStyle={styles.chipScrollContent}
              >
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, theme.chip, editCategory === item && styles.activeChip]}
                    onPress={() => setEditCategory(item)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        theme.chipText,
                        editCategory === item && styles.activeChipText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={saveEdit}>
              <Text style={styles.addButtonText}>Simpan Perubahan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEditModal(false)}
            >
              <Text style={styles.closeText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const lightStyles = StyleSheet.create({
  container: { backgroundColor: '#f4f7f4' },
  card: { backgroundColor: '#ffffff' },
  title: { color: '#073b16' },
  subtitle: { color: '#777' },
  text: { color: '#073b16' },
  input: {
    backgroundColor: '#fff',
    color: '#111',
    borderColor: '#ddd',
  },
  chip: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  chipText: {
    color: '#555',
  },
  sortButton: {
    backgroundColor: '#e8f6ee',
  },
  sortText: {
    color: '#073b16',
  },
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#101914' },
  card: { backgroundColor: '#1b2a21' },
  title: { color: '#d8f8df' },
  subtitle: { color: '#b6c7bb' },
  text: { color: '#f2fff5' },
  input: {
    backgroundColor: '#1b2a21',
    color: '#fff',
    borderColor: '#31513d',
  },
  chip: {
    backgroundColor: '#1b2a21',
    borderColor: '#31513d',
  },
  chipText: {
    color: '#b6c7bb',
  },
  sortButton: {
    backgroundColor: '#1b2a21',
    borderWidth: 1,
    borderColor: '#31513d',
  },
  sortText: {
    color: '#b6c7bb',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  statsBox: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  darkButton: {
    backgroundColor: '#00b894',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  darkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  chipScrollContainer: {
    marginBottom: 10,
  },
  smallChipScrollContainer: {
    marginBottom: 10,
  },
  sortScrollContainer: {
    marginBottom: 10,
  },
  chipScroll: {
    flexGrow: 0,
  },
  smallChipScroll: {
    flexGrow: 0,
  },
  sortScroll: {
    flexGrow: 0,
  },
  chipScrollContent: {
    alignItems: 'center',
    paddingRight: 18,
  },
  chip: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  smallChip: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  activeChip: {
    backgroundColor: '#00b894',
    borderColor: '#00b894',
  },
  chipText: {
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  smallChipText: {
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  activeChipText: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#073b16',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sortButton: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  sortActive: {
    backgroundColor: '#bdf0d6',
    borderWidth: 1,
    borderColor: '#00b894',
  },
  sortText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  sortActiveText: {
    color: '#073b16',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  apiButton: {
    flex: 1,
    backgroundColor: '#0984e3',
    padding: 10,
    borderRadius: 10,
  },
  pinButton: {
    flex: 1,
    backgroundColor: '#6c5ce7',
    padding: 10,
    borderRadius: 10,
  },
  deleteAllButton: {
    flex: 1,
    backgroundColor: '#d63031',
    padding: 10,
    borderRadius: 10,
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cacheText: {
    fontSize: 11,
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  noteCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#00b894',
  },
  noteContent: {
    marginBottom: 10,
  },
  noteText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  noteMeta: {
    marginTop: 6,
    color: '#888',
    fontSize: 11,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#fdcb6e',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: '#ff7675',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  noteActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyBox: {
    padding: 25,
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#eee',
    padding: 13,
    borderRadius: 12,
  },
  closeText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});