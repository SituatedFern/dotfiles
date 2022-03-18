" Plugins
call plug#begin()
	Plug 'neoclide/coc.nvim', {'branch': 'release'}
	Plug 'preservim/nerdtree'
	Plug 'ryanoasis/vim-devicons'
call plug#end()

" Start NERDtree and put the cursor back in the other window
autocmd VimEnter * NERDTree | wincmd p

" Exit Vim if NERDTree is the only window remaining in the only tab.
autocmd BufEnter * if tabpagenr('$') == 1 && winnr('$') == 1 && exists('b:NERDTree') && b:NERDTree.isTabTree() | quit | endif

" Close the tab if NERDTree is the only window remaining in it.
autocmd BufEnter * if winnr('$') == 1 && exists('b:NERDTree') && b:NERDTree.isTabTree() | quit | endif

" turn hybrid line numbers on
":set number relativenumber
":set nu rnu

" turn absolute numbers on
:set number
:set nu

" bind CTRL+f to toggle the file manager
nmap <C-f> :NERDTreeToggle<CR>
  
set guifont=JetBrainsMono\ Nerd\ Font\ 11

" Shortcuts for split navigation
map <C-h> <C-w>h
map <C-j> <C-w>j
map <C-k> <C-w>k
map <C-l> <C-w>l
