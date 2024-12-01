from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_not_required
from .forms import SignUpForm, LoginForm


@login_not_required
def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('index', chat_id=1)
    else:
        form = SignUpForm()

    return render(request, 'signup.html', {'form': form})


@login_not_required
def login_view(request):
    form = LoginForm(data=request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('index', chat_id=1)
    return render(request, 'login.html', {'form': form})