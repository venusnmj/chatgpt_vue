<script setup>
    import DragFile from './DragFile.vue';
    // import LoadingBar from './LoadingBar.vue'
</script>

<template>
    <div class="container">
        <div class="muted-sect">
            <DragFile/>
            <!-- <LoadingBar/> -->
        </div>
    </div>
</template>

<style scoped>
    .container{
        padding: 1rem 4rem;
    }
    .muted-sect{
        background-color: #F0F2F5;
        padding: 2rem;
        border-radius: 10px;
    }
    .fileUpload{
        width: 100%;
        margin: 1rem;
        display: flex;
        flex-direction: column;
    }
    .drag-field{
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
    .button{
        background-color: #3385ff;
        background-image: linear-gradient(90deg, #006eff, #13adff);
        font-size: 1.5rem;
        color: #fff;
        box-shadow: 0 5px 10px 0 rgba(16, 110, 253, .3);
        padding: 0.3rem 4rem;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .button i{
        font-size: 2rem;
    }

    input[type="file"] {
        display : none;
    }
</style>